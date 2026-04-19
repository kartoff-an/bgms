import React from "react";
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { Radius, Elevation } from "@app/constants/theme";

export interface ThemedCardProps extends ViewProps {
    style?: StyleProp<ViewStyle>;
    variant?: "default" | "elevated" | "outlined";
    radius?: "sm" | "md" | "lg" | "xl" | "none";
    padding?: "sm" | "md" | "lg" | "none";
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
    variant = "default",
    radius = "md",
    padding = "md",
    style,
    children,
    ...props
}) => {
    const theme = useThemeColor();

    const getBorderRadius = () => {
        switch (radius) {
            case "sm":
                return Radius.sm;
            case "md":
                return Radius.md;
            case "lg":
                return Radius.lg;
            case "xl":
                return Radius.xl;
            default:
                return 0;
        }
    };

    const getPadding = () => {
        switch (padding) {
            case "sm":
                return 12;
            case "md":
                return 16;
            case "lg":
                return 24;
            default:
                return 0;
        }
    };

    const getVariantStyles = (): ViewProps["style"] => {
        switch (variant) {
            case "elevated":
                return {
                    backgroundColor: theme.card,
                    ...Elevation.sm,
                };
            case "outlined":
                return {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: theme.border,
                };
            default:
                return {
                    backgroundColor: theme.card,
                };
        }
    };

    return (
        <View
            style={[
                styles.base,
                getVariantStyles(),
                {
                    borderRadius: getBorderRadius(),
                    padding: getPadding(),
                },
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        overflow: "hidden",
    },
});