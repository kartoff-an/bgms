import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Alert
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";

import { ThemedText } from "@app/components/ui/themed-text";
import { ThemedInput } from "@app/components/ui/themed-input";
import { ThemedButton } from "@app/components/ui/themed-button";
import { ErrorDisplay } from "@app/components/error-display";
import { useAuth } from "@app/contexts/auth.context";

type VerifyForm = {
    otp: string;
};

export default function VerifyEmailScreen() {

    const { email } = useLocalSearchParams<{ email: string }>();
    const { verifyEmail } = useAuth();

    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<VerifyForm>({
        defaultValues: {
            otp: "",
        },
    });

    const onSubmit = async (data: VerifyForm) => {
        try {
            setServerError(null);

            if (!email) {
                setServerError("Email is missing.");
                return;
            }

            await verifyEmail(email, data.otp);

            Alert.alert(
                "Email Verified",
                "Your email has been verified. You can now login.",
                [
                    {
                        text: "Go to Login",
                        onPress: () => router.replace("/(auth)/login"),
                    },
                ]
            );

        } catch (err: any) {
            setServerError(err.message || "Invalid OTP");
        }
    };

    return (
        <View style={styles.container}>

            <ThemedText style={styles.title}>
                Verify Email
            </ThemedText>

            <ThemedText style={styles.subtitle}>
                Enter the OTP sent to {email}
            </ThemedText>

            <Controller
                control={control}
                name="otp"
                rules={{
                    required: "OTP is required",
                    minLength: {
                        value: 6,
                        message: "OTP must be 6 digits"
                    }
                }}
                render={({ field: { onChange, value } }) => (
                    <ThemedInput
                        placeholder="Enter OTP"
                        keyboardType="numeric"
                        value={value}
                        onChangeText={onChange}
                    />
                )}
            />

            {errors.otp && (
                <ErrorDisplay message={errors.otp.message!} />
            )}

            {serverError && (
                <ErrorDisplay message={serverError} />
            )}

            <ThemedButton
                title={isSubmitting ? "Verifying..." : "Verify Email"}
                size="md"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 30,
    },
});