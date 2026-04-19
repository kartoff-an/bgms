import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
    themeMode: ThemeMode;
    isDarkMode: boolean;
    setThemeMode: (mode: ThemeMode) => void;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeMode>("system");

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (saved === "light" || saved === "dark" || saved === "system") {
                setThemeMode(saved);
            }
        } catch (error) {
            console.error("Failed to load theme preference:", error);
        }
    };

    const setThemeModeWithStorage = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            setThemeMode(mode);
        } catch (error) {
            console.error("Failed to save theme preference:", error);
        }
    };

    const toggleDarkMode = () => {
        if (themeMode === "dark") {
            setThemeModeWithStorage("light");
        } else if (themeMode === "light") {
            setThemeModeWithStorage("dark");
        } else {
            const currentIsDark = systemScheme === "dark";
            setThemeModeWithStorage(currentIsDark ? "light" : "dark");
        }
    };

    const isDarkMode = themeMode === "system"
        ? systemScheme === "dark"
        : themeMode === "dark";

    return (
        <ThemeContext.Provider value={{
            themeMode,
            isDarkMode,
            setThemeMode: setThemeModeWithStorage,
            toggleDarkMode,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}