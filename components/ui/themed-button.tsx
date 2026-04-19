import React from "react";
import {
    TouchableOpacity,
    StyleSheet,
    TouchableOpacityProps,
    ActivityIndicator,
    View,
} from "react-native";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedText } from "./themed-text";
import { Radius } from "@app/constants/theme";

export interface ThemedButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: "primary" | "outline" | "danger" | "ghost" | "success" | "warning";
    size: "sm" | "md" | "lg";
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
    title,
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = "left",
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

    const getBorderColor = () => {
        switch (variant) {
            case "primary":
                return theme.primary;
            case "outline":
                return theme.border;
            case "danger":
                return theme.danger;
            case "success":
                return theme.success;
            case "warning":
                return theme.warning;
            default:
                return undefined;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.textSecondary;

        if (variant !== "outline" && variant !== "ghost") {
            return "#FFFFFF";
        }

        if (variant === "outline") {
            return theme.primary;
        }
    };

    const getPaddingVertical = () => {
        switch (size) {
            case "sm":
                return 10;
            case "lg":
                return 16;
            default:
                return 12;
        }
    };

    const getPaddingHorizontal = () => {
        switch (size) {
            case "sm":
                return 16;
            case "lg":
                return 24;
            default:
                return 20;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case "sm":
                return 13;
            case "lg":
                return 17;
            default:
                return 15;
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderWidth: variant === "outline" ? 1.5 : 0,
                    borderColor: getBorderColor(),
                    paddingVertical: getPaddingVertical(),
                    paddingHorizontal: getPaddingHorizontal(),
                    width: fullWidth ? "100%" : "auto",
                    opacity: disabled ? 0.6 : 1,
                },
                style,
            ]}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator size="small" color={getTextColor()} />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === "left" && <View style={styles.iconLeft}>{icon}</View>}
                    <ThemedText
                        variant={
                            variant === "outline" || variant === "ghost" ? "primary" : "primary"
                        }
                        style={[
                            styles.text,
                            {
                                color: getTextColor(),
                                fontSize: getFontSize(),
                            },
                        ]}
                    >
                        {title}
                    </ThemedText>
                    {icon && iconPosition === "right" && (
                        <View style={styles.iconRight}>{icon}</View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: Radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontWeight: "600",
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});
