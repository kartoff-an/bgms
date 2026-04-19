import React from "react";
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from "react-native";
import { useThemeColor } from "@app/hooks/use-theme-color";

export interface ThemedTextProps extends TextProps {
    style?: StyleProp<TextStyle>;
    variant?: "primary" | "secondary" | "success" | "danger" | "warning";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    weight?: "normal" | "medium" | "semibold" | "bold";
    center?: boolean;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
    variant = "primary",
    size = "sm",
    weight = "normal",
    center = false,
    style,
    children,
    ...props
}) => {
    const theme = useThemeColor();

    const getColor = () => {
        switch (variant) {
            case "secondary":
                return theme.textSecondary;
            case "success":
                return theme.success;
            case "danger":
                return theme.danger;
            case "warning":
                return theme.warning;
            default:
                return theme.textPrimary;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case "xs":
                return 11;
            case "sm":
                return 13;
            case "md":
                return 15;
            case "lg":
                return 18;
            case "xl":
                return 22;
        }
    };

    const getFontWeight = () => {
        switch (weight) {
            case "medium":
                return "500";
            case "semibold":
                return "600";
            case "bold":
                return "700";
            default:
                return "400";
        }
    };

    return (
        <Text
            style={[
                // styles.base,
                {
                    color: getColor(),
                    fontSize: getFontSize(),
                    fontWeight: getFontWeight(),
                    textAlign: center ? "center" : "left",
                },
                style,
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};
