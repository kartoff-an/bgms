import React from "react";
import { TouchableOpacity, StyleSheet, TouchableOpacityProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@app/hooks/use-theme-color";

export interface ThemedIconButtonProps extends TouchableOpacityProps {
    icon: keyof typeof Ionicons.glyphMap;
    variant?: "primary" | "outline" | "danger" | "ghost" | "success" | "warning";
    size: "sm" | "md" | "lg";
    iconSize?: number;
}

export const ThemedIconButton: React.FC<ThemedIconButtonProps> = ({
    icon,
    variant = "primary",
    size = "md",
    iconSize,
    style,
    disabled,
    ...props
}) => {
    const theme = useThemeColor();

    const getBackgroundColor = () => {
        if (disabled) return theme.border;

        switch (variant) {
            case "outline":
            case "ghost":
                return "transparent";
            case "danger":
                return theme.danger;
            case "success":
                return theme.success;
            case "warning":
                return theme.warning;
            default:
                return theme.primary;
        }
    };

    const getIconColor = () => {
        if (disabled) return theme.textSecondary;

        switch (variant) {
            case "primary":
                return theme.primary;
            case "danger":
                return theme.danger;
            case "success":
                return theme.success;
            case "warning":
                return theme.warning;
            default:
                return "#FFFFFF";
        }
    };

    const getSize = () => {
        switch (size) {
            case "sm":
                return 36;
            case "lg":
                return 52;
            default:
                return 44;
        }
    };

    const getIconSize = () => {
        if (iconSize) return iconSize;
        switch (size) {
            case "sm":
                return 18;
            case "lg":
                return 26;
            default:
                return 22;
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    width: getSize(),
                    height: getSize(),
                    borderRadius: getSize() / 2,
                    borderWidth: variant === "outline" ? 1.5 : 0,
                    borderColor: variant === "outline" ? getBackgroundColor() : undefined,
                    opacity: disabled ? 0.6 : 1,
                },
                style,
            ]}
            disabled={disabled}
            {...props}
        >
            <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        justifyContent: "center",
    },
});
