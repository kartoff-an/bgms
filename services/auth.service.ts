import { api } from "@app/api/client";
import { ApiError } from "@app/types/api-error";
import { LoginRequest, LoginResponse } from "@app/types/auth";
import { User, UserCreate } from "@app/types/user";

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const payload: LoginRequest = {
            email,
            password,
            authClientType: "MOBILE",
        };

        const { data } = await api.post<LoginResponse>("/auth/login", payload);

        return data;
        } catch (error) {
            const apiError = error as ApiError;

            throw new Error(apiError.message || "Login failed");
        }
    },

    async signup(userData: UserCreate): Promise<User> {
        try {
            const { data } = await api.post<User>("/auth/signup", userData);
            return data;
        } catch (error) {
            const apiError = error as ApiError;

            if (apiError.status === 409) {
                throw new Error("User with this email already exists");
            }

            if (apiError.status === 422 && apiError.details) {
                const validationMessage = apiError.details
                    .map(detail => `${detail.field}: ${detail.message}`)
                    .join(", ");
                throw new Error(validationMessage);
            }

            throw new Error(apiError.message || "Signup failed");
        }
    },

    async me(): Promise<User> {
        try {
            const { data } = await api.get<User>("/auth/me");
            return data;
        } catch (error) {
            const apiError = error as ApiError;

            if (apiError.status === 401) {
                throw new Error("UNAUTHORIZED");
            }

            throw new Error(apiError.message || "Failed to get user information");
        }
    },

    async refreshToken(token: string): Promise<LoginResponse> {
        try {
            const { data } = await api.post<LoginResponse>("/auth/refresh", {
                refreshToken: token,
            });
            return data;
        } catch (error) {
            const apiError = error as ApiError;

            if (apiError.status === 401) {
                // Refresh token expired or invalid
                throw new Error("Refresh token expired. Please login again.");
            }

            throw new Error(apiError.message || "Failed to refresh token");
        }
    },

    async verifyEmail(email: string, otp: string): Promise<void> {
        await api.post("/auth/verify-email", {email, otp});
    },

    async requestPasswordCode(email: string): Promise<void> {
        await api.post("/auth/request-password-code", { email })
    },

    async verifyPasswordCode(email: string, code: string, newPassword?: string): Promise<void> {
        api.post("/auth/verify-password-code", {
            email,
            code,
            newPassword
        })
    },

    async requestEmailVerificationCode(email: string): Promise<void> {
        api.post("/auth/email-verification-code", { email });
    }
};
