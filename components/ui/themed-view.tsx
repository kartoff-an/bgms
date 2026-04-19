import React, { ReactNode } from "react";
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useThemeColor } from "@app/hooks/use-theme-color";

export interface ThemedViewProps extends ViewProps {
    style?: StyleProp<ViewStyle>;
    variant?: "default" | "surface" | "card";
    children?: ReactNode;
}

export const ThemedView: React.FC<ThemedViewProps> = ({
    variant = "default",
    style,
    children,
    ...props
}) => {
    const theme = useThemeColor();

    const getBackgroundColor = () => {
        switch (variant) {
            case "surface":
                return theme.surface;
            case "card":
                return theme.card;
            case "default":
                return theme.background;
        }
    };

    return (
        <View style={[styles.base, { backgroundColor: getBackgroundColor() }, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        flex: 1,
    },
});
