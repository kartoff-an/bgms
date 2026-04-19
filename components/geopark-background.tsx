import React from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColor } from "@app/hooks/use-theme-color";

export const GeoparkBackground = () => {
    const theme = useThemeColor();

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Top Circle */}
            <View
                style={[
                    styles.circle,
                    {
                        backgroundColor: theme.primary,
                        opacity: 0.08,
                        width: 200,
                        height: 200,
                        top: -40,
                        right: -60,
                    },
                ]}
            />

            {/* Bottom Circle */}
            <View
                style={[
                    styles.circle,
                    {
                        backgroundColor: theme.accent,
                        opacity: 0.08,
                        width: 250,
                        height: 250,
                        bottom: -80,
                        left: -80,
                    },
                ]}
            />

            {/* Leaf Shapes */}
            <View
                style={[
                    styles.leaf,
                    {
                        backgroundColor: theme.primary,
                        opacity: 0.06,
                        top: 120,
                        left: -30,
                    },
                ]}
            />

            <View
                style={[
                    styles.leaf,
                    {
                        backgroundColor: theme.accent,
                        opacity: 0.06,
                        bottom: 120,
                        right: -30,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    circle: {
        position: "absolute",
        borderRadius: 500,
    },

    leaf: {
        position: "absolute",
        width: 160,
        height: 80,
        borderRadius: 80,
        transform: [{ rotate: "45deg" }],
    },
});
