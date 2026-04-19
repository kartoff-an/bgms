import { Platform } from "react-native";

export const Colors = {
    light: {
        backgroundGradient: ["#F4F7F1", "#E8F0E3", "#DDE9D5"],

        primary: "#3A7D44",
        primaryDark: "#1F4D2B",
        accent: "#8FAE5D",

        textPrimary: "#1F2D1E",
        textSecondary: "#5C6B57",

        inputBackground: "#FFFFFF",
        inputIcon: "#6D8B5A",
        placeholder: "#A0B39A",

        border: "#D5E2CF",
        shadow: "#000000",

        /** NEW SEMANTIC COLORS */
        background: "#FFFFFF",
        surface: "#FFFFFF",
        card: "#FFFFFF",
        overlay: "rgba(0,0,0,0.45)",

        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
    },

    dark: {
        backgroundGradient: ["#0F1A12", "#162317", "#1E2C1E"],

        primary: "#7FB069",
        primaryDark: "#0F1A12",
        accent: "#A6C48A",

        textPrimary: "#E9F1E5",
        textSecondary: "#A5B49D",

        inputBackground: "#243223",
        inputIcon: "#7FB069",
        placeholder: "#6C7A67",

        border: "#2F3C2D",
        shadow: "#000000",

        /** NEW SEMANTIC COLORS */
        background: "#0F1A12",
        surface: "#1E2C1E",
        card: "#243223",
        overlay: "rgba(0,0,0,0.6)",

        success: "#4ADE80",
        warning: "#FBBF24",
        danger: "#F87171",
        info: "#60A5FA",
    },
} as const;

export const Fonts = Platform.select({
    default: {
        sans: "normal",
        serif: "serif",
        rounded: "normal",
        mono: "monospace",
    },
});

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const Radius = {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 32,
};

export const Elevation = {
    sm: {
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
};

export type ThemeColor = keyof typeof Colors.light;
