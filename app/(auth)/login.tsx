import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    View,
    TouchableOpacity,
    StyleSheet,
    Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";

import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedText } from "@app/components/ui/themed-text";
import { ThemedInput } from "@app/components/ui/themed-input";
import { ThemedButton } from "@app/components/ui/themed-button";
import { ErrorDisplay } from "@app/components/error-display";
import { useAuth } from "@app/contexts/auth.context";
import { GeoparkBackground } from "@app/components/geopark-background";

export default function LoginScreen() {
    const theme = useThemeColor();
    const { login, error, clearError } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(30)).current;

    const handleSubmit = async () => {
        if (!email || !password) return;

        try {
            setIsSubmitting(true);
            await login(email, password)

        }
        finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slide, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useFocusEffect(
        useCallback(() => {
            clearError();
        }, [clearError])
    );

    return (
        <LinearGradient colors={theme.backgroundGradient} style={styles.container}>
            <GeoparkBackground />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.animatedContainer,
                            { opacity: fade, transform: [{ translateY: slide }] },
                        ]}
                    >
                        {/* Logo */}
                        <View style={styles.header}>
                            <View style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: "transparent",
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: 16,
                                overflow: "hidden",
                            }}>
                                <Image
                                    source={require("@app/assets/images/BGMS_icon.png")}
                                    style={{ width: "100%", height: "100%", borderRadius: 100 }}
                                    resizeMode="contain"
                                />
                            </View>

                            <ThemedText style={styles.title}>
                                Bohol Geopark
                            </ThemedText>

                            <ThemedText
                                variant="secondary"
                                style={styles.subtitle}
                            >
                                Monitoring System
                            </ThemedText>
                        </View>

                        {/* Email */}
                        <ThemedInput
                            icon="mail-outline"
                            placeholder="Email address"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                clearError();
                            }}
                        />

                        {/* Password */}
                        <ThemedInput
                            icon="lock-closed-outline"
                            placeholder="Password"
                            secureTextEntry
                            showPasswordToggle
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                clearError();
                            }}
                        />

                        {error ? <ErrorDisplay message={error} /> : null}

                        {/* Button*/}
                        <ThemedButton
                            title={isSubmitting ? "Logging In..." : "Log In"}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            size="md"
                        />

                        {/* Sign Up Link */}
                        <View style={styles.signupRow}>
                            <ThemedText
                                variant="secondary"
                                style={styles.signupText}
                            >
                                Don&apos;t have an account?
                            </ThemedText>

                            <TouchableOpacity
                                onPress={() => router.push("/(auth)/signup")}
                                activeOpacity={0.7}
                                disabled={isSubmitting}
                            >
                                <ThemedText
                                    style={[
                                        styles.signupLink,
                                        { color: theme.primary },
                                    ]}
                                >
                                    Sign Up
                                </ThemedText>
                            </TouchableOpacity>
                        </View>

                        <ThemedText
                            variant="secondary"
                            style={styles.footerText}
                        >
                            Report damages. Protect geosites. Preserve nature.
                        </ThemedText>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 28,
    },
    animatedContainer: {},
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        marginTop: 4,
    },
    signupRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        gap: 4,
    },
    signupText: {
        fontSize: 14,
    },
    signupLink: {
        fontWeight: "600",
        fontSize: 14,
    },
    footerText: {
        textAlign: "center",
        marginTop: 20,
    },
});