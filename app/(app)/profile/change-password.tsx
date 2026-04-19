import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useThemeColor } from "@app/hooks/use-theme-color";
import {
    ThemedScreenWrapper,
    ThemedView,
    ThemedText,
    ThemedInput,
    ThemedButton,
} from "@app/components/ui";
import { useAuth } from "@app/contexts/auth.context";

export default function ChangePasswordScreen() {

    const theme = useThemeColor();
    const router = useRouter();

    const {
        requestPasswordCode,
        verifyPasswordCode,
    } = useAuth();

    const [step, setStep] = useState<1 | 2>(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRequestCode = async () => {
        try {
            setLoading(true);
            setError(null);

            await requestPasswordCode(email);

            Alert.alert("Success", "OTP sent to your email");
            setStep(2);

        } catch (e: any) {
            setError(e.message || "Failed to send code");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        try {
            setLoading(true);
            setError(null);

            await verifyPasswordCode(email, otp, newPassword);

            Alert.alert(
                "Success",
                "Password changed successfully",
                [
                    {
                        text: "Go to Login",
                        onPress: () => router.replace("/(auth)/login"),
                    },
                ]
            );

        } catch (e: any) {
            setError(e.message || "Invalid OTP or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedScreenWrapper>
            <ThemedView style={styles.container}>

                <View style={styles.header}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={28}
                        color={theme.primary}
                    />
                    <ThemedText size="lg" weight="bold">
                        Change Password
                    </ThemedText>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >

                    {step === 1 && (
                        <View style={styles.form}>
                            <ThemedInput
                                icon="mail-outline"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <ThemedButton
                                title={loading ? "Sending..." : "Send OTP"}
                                size="md"
                                onPress={handleRequestCode}
                                disabled={loading}
                            />
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.form}>

                            <ThemedInput
                                icon="key-outline"
                                placeholder="OTP Code"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="numeric"
                            />

                            <ThemedInput
                                icon="lock-closed-outline"
                                placeholder="New Password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />

                            <ThemedButton
                                title={loading ? "Updating..." : "Change Password"}
                                size="md"
                                onPress={handleChangePassword}
                                disabled={loading}
                            />
                        </View>
                    )}

                    {error && (
                        <ThemedText style={styles.error}>
                            {error}
                        </ThemedText>
                    )}

                </KeyboardAvoidingView>

            </ThemedView>
        </ThemedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
        gap: 10,
    },
    form: {
        gap: 14,
    },
    error: {
        marginTop: 12,
        textAlign: "center",
        color: "red",
    },
});