import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@app/hooks/use-theme-color";

interface ErrorDisplayProps {
    message: string | undefined;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    const theme = useThemeColor();

    const isLight = theme.card === "#FFFFFF";
    const backgroundColor = isLight ? "#FFF5F5" : "#4A2F2F";
    const borderColor = isLight ? "#F5C2C2" : "#843C3C";
    const textColor = isLight ? "#9B1C1C" : "#E0A0A0";

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-8)).current;

    const prevMessage = useRef<string | undefined>("");

    useEffect(() => {
        if (message && message !== prevMessage.current) {
            fadeAnim.setValue(0);
            slideAnim.setValue(-8);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        prevMessage.current = message;
    }, [message, fadeAnim, slideAnim]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor,
                    borderColor,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <Ionicons name="alert-circle" size={16} color={textColor} style={{ marginRight: 6 }} />
            <Text style={[styles.text, { color: textColor }]}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 8,
    },
    text: {
        flex: 1,
        fontSize: 12,
        fontWeight: "500",
    },
});
