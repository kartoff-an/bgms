import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoginResponse } from "@app/types/auth";
import { User, UserCreate } from "@app/types/user";
import { authService } from "@app/services/auth.service";
import { setAuthToken } from "@app/api/client";
import { router, useRouter, useSegments } from "expo-router";
import { ErrorHandler } from "../utils/error-handler";
interface AuthContextType {
    userToken: string | null;
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: UserCreate) => Promise<User>;
    logout: () => Promise<void>;
    updateProfile: (update: User) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    requestPasswordCode: (email: string) => Promise<void>;
    verifyPasswordCode: (
        email: string,
        code: string,
        newPassword?: string
    ) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

function useProtectedRoute(userToken: string | null, user: User | null, loading: boolean) {
    const segments = useSegments();
    const router = useRouter();

    const AUTH_ROUTE_PREFIX = "(auth)";

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === AUTH_ROUTE_PREFIX;
        const isAuthenticated = !!userToken && !!user;

        if (!isAuthenticated && !inAuthGroup) {
            router.replace("/(auth)/login");
        } else if (isAuthenticated && inAuthGroup) {
            router.replace("/(app)/(tabs)/maps");
        }
    }, [userToken, user, loading, segments, router]);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;
    const SECONDS_TO_MS = 1000;

    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [expiryTime, setExpiryTime] = useState<number | null>(null);
    const refreshTimerRef = React.useRef<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useProtectedRoute(userToken, user, loading);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const refreshToken = useCallback(async () => {
        try {
            const storedRefreshToken = await AsyncStorage.getItem("refreshToken");
            if (!storedRefreshToken) {
                await logout();
                return;
            }

            const data: LoginResponse = await authService.refreshToken(storedRefreshToken);
            const expiry = Date.now() + (Number(data.expiresIn) * SECONDS_TO_MS);

            await AsyncStorage.multiSet([
                ["accessToken", data.accessToken],
                ["refreshToken", data.refreshToken],
                ["accessTokenExpiry", expiry.toString()]
            ]);

            setUserToken(data.accessToken);
            setAuthToken(data.accessToken);
            setExpiryTime(expiry);
            setUser(data.user);
        } catch (error) {
            console.error("Token refresh failed: ", error);
            setError("Unable to refresh session. Please login again.");
            await logout();
        }
    }, []);

    const scheduleTokenRefresh = useCallback(() => {
        if (!expiryTime) return;

        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }

        const timeUntilExpiry = expiryTime - Date.now();
        const refreshTime = timeUntilExpiry - TOKEN_REFRESH_BUFFER_MS;

        if (refreshTime <= 0) {
            refreshToken();
            return;
        }

        refreshTimerRef.current = setTimeout(() => {
            refreshToken();
        }, refreshTime);

    }, [expiryTime, refreshToken]);

    useEffect(() => {
        scheduleTokenRefresh();

        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }
        };
    }, [expiryTime]);

    // Restore session on mount
    useEffect(() => {
        const loadToken = async () => {
            try {
                const [token, expiry] = await AsyncStorage.multiGet(["accessToken", "accessTokenExpiry"]);

                const accessToken = token[1];
                const tokenExpiry = expiry[1];

                if (accessToken && tokenExpiry && Number(tokenExpiry) > Date.now()) {
                    setUserToken(accessToken);
                    setAuthToken(accessToken);
                    setExpiryTime(Number(tokenExpiry));

                    const profile = await authService.me();
                    setUser(profile);
                    setError(null);
                } else if (accessToken && tokenExpiry && Number(tokenExpiry) <= Date.now()) {
                    await refreshToken();
                }
            } catch (error) {
                setError(ErrorHandler.getAuthErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };
        loadToken();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            clearError();

            const data: LoginResponse = await authService.login(email, password);
            const expiry = Date.now() + Number(data.expiresIn) * SECONDS_TO_MS;

            await AsyncStorage.multiSet([
                ["accessToken", data.accessToken],
                ["refreshToken", data.refreshToken],
                ["accessTokenExpiry", expiry.toString()]
            ]);

            setUserToken(data.accessToken);
            setAuthToken(data.accessToken);
            setUser(data.user);
            setExpiryTime(expiry);
            setError(null);
        } catch (error) {
            const apiError = ErrorHandler.handle(error);
            setError(ErrorHandler.getAuthErrorMessage(error));
            console.log(apiError);
            if (apiError.message === "User account is unverified.") {
                authService.requestEmailVerificationCode(email);
                router.replace({
                    pathname: "/(auth)/verify-email",
                    params: { email }
                });
            }
        }
        finally {
            setLoading(false);
        }
    };

    const signup = async (userData: UserCreate) => {
        try {
            clearError();
            const response = await authService.signup(userData);
            setError(null);
            return response;
        } catch (error) {
            setError(ErrorHandler.getAuthErrorMessage(error));
            throw new Error(ErrorHandler.getAuthErrorMessage(error))
        }
    };

    const logout = async () => {
        try {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }

            await AsyncStorage.multiRemove([
                "accessToken",
                "refreshToken",
                "accessTokenExpiry"
            ]);

            setUserToken(null);
            setAuthToken(null);
            setUser(null);
            setExpiryTime(null);
            setError(null);
        } catch (error) {
            const apiError = ErrorHandler.handle(error);
            console.error("[Error] ", apiError.message);
        }
    };

    const updateProfile = async (updated: User) => {
        setUser(updated);
    };

    const verifyEmail = async (email: string, code: string): Promise<void> => {
        try {
            setLoading(true);
            clearError();

            await authService.verifyEmail(email, code);

            setError(null);
        } catch (error) {
            const message = ErrorHandler.getAuthErrorMessage(error);
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const requestPasswordCode = async (email: string) => {
        try {
            clearError();
            await authService.requestPasswordCode(email);
        } catch (error) {
            const msg = ErrorHandler.getAuthErrorMessage(error);
            setError(msg);
            throw new Error(msg);
        }
    };

    const verifyPasswordCode = async (
        email: string,
        code: string,
        newPassword?: string
    ) => {
        try {
            clearError();
            await authService.verifyPasswordCode(email, code, newPassword);
        } catch (error) {
            const msg = ErrorHandler.getAuthErrorMessage(error);
            setError(msg);
            throw new Error(msg);
        }
    };



    return (
        <AuthContext.Provider
            value={{
                userToken,
                user,
                loading,
                error,
                login,
                signup,
                logout,
                updateProfile,
                verifyEmail,
                requestPasswordCode,
                verifyPasswordCode,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
