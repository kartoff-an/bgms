import React, { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    View,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";

import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedText } from "@app/components/ui/themed-text";
import { ThemedInput } from "@app/components/ui/themed-input";
import { ThemedButton } from "@app/components/ui/themed-button";
import { ErrorDisplay } from "@app/components/error-display";
import { useAuth } from "@app/contexts/auth.context";
import { GeoparkBackground } from "@app/components/geopark-background";
import { municipalityService } from "@app/services/municipality.service";
import { Municipality } from "@app/types/municipality";
import { SignUpForm } from "@app/types/auth";

export default function SignUpScreen() {
    const theme = useThemeColor();
    const { signup } = useAuth();

    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(true);
    const [selectedMunicipalityName, setSelectedMunicipalityName] = useState("");
    const [serverError, setServerError] = useState<string | null>(null);

    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(30)).current;

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<SignUpForm>({
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            municipalityId: "",
        },
    });

    const password = watch("password");

    useEffect(() => {
        fetchMunicipalities();
    }, []);

    const fetchMunicipalities = async () => {
        try {
            setLoadingMunicipalities(true);
            const data = await municipalityService.getAll();
            setMunicipalities(data);
        } catch {
            setServerError("Failed to load municipalities. Please try again.");
        } finally {
            setLoadingMunicipalities(false);
        }
    };

    const onSubmit = async (data: SignUpForm) => {
        try {
            setServerError(null);

            await signup({
                fullName: data.fullName.trim(),
                email: data.email.toLowerCase().trim(),
                password: data.password,
                municipalityId: data.municipalityId,
            });

            router.replace({
                pathname: "./verify-email",
                params: { email: data.email },
            });
        } catch (err: any) {
            setServerError(err.message || "Registration failed.");
        }
    };

    const handleSelectMunicipality = (municipality: Municipality) => {
        setValue("municipalityId", municipality.id);
        setSelectedMunicipalityName(municipality.name);
        clearErrors("municipalityId");
        setModalVisible(false);
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
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.backButton}
                            >
                                <Ionicons name="arrow-back" size={24} color={theme.info} />
                            </TouchableOpacity>

                            <View
                                style={[
                                    styles.iconCircle,
                                    { backgroundColor: theme.primary },
                                ]}
                            >
                                <Ionicons
                                    name="person-add-outline"
                                    size={32}
                                    color="#fff"
                                />
                            </View>

                            <ThemedText style={styles.title}>
                                Create Account
                            </ThemedText>

                            <ThemedText variant="secondary" style={styles.subtitle}>
                                Join the Bohol Geopark Community
                            </ThemedText>
                        </View>

                        {/* Full Name */}
                        <Controller
                            control={control}
                            name="fullName"
                            rules={{ required: "Full name is required" }}
                            render={({ field: { onChange, value } }) => (
                                <ThemedInput
                                    icon="person-outline"
                                    placeholder="Full Name"
                                    value={value}
                                    autoCapitalize="words"
                                    onChangeText={(text) => {
                                        onChange(text);
                                        clearErrors("fullName");
                                    }}
                                />
                            )}
                        />
                        {errors.fullName && (
                            <ErrorDisplay message={errors.fullName.message!} />
                        )}

                        {/* Email */}
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email address",
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <ThemedInput
                                    icon="mail-outline"
                                    placeholder="Email Address"
                                    value={value}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.email && (
                            <ErrorDisplay message={errors.email.message!} />
                        )}

                        {/* Password */}
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message:
                                        "Password must be at least 8 characters",
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <ThemedInput
                                    icon="lock-closed-outline"
                                    placeholder="Password"
                                    secureTextEntry
                                    showPasswordToggle
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.password && (
                            <ErrorDisplay message={errors.password.message!} />
                        )}

                        {/* Confirm Password */}
                        <Controller
                            control={control}
                            name="confirmPassword"
                            rules={{
                                required: "Confirm password is required",
                                validate: (value) =>
                                    value === password ||
                                    "Passwords do not match",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <ThemedInput
                                    icon="lock-closed-outline"
                                    placeholder="Confirm Password"
                                    secureTextEntry
                                    showPasswordToggle
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.confirmPassword && (
                            <ErrorDisplay
                                message={errors.confirmPassword.message!}
                            />
                        )}

                        {/* Municipality Picker */}
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            style={[
                                styles.municipalityPicker,
                                {
                                    backgroundColor: theme.inputBackground,
                                    borderColor: theme.border,
                                },
                            ]}
                        >
                            <Ionicons
                                name="location-outline"
                                size={20}
                                color={theme.textSecondary}
                                style={styles.locationIcon}
                            />

                            <ThemedText
                                style={{
                                    flex: 1,
                                    color: selectedMunicipalityName
                                        ? theme.info
                                        : theme.textSecondary,
                                }}
                            >
                                {loadingMunicipalities
                                    ? "Loading municipalities..."
                                    : selectedMunicipalityName ||
                                    "Select Municipality"}
                            </ThemedText>

                            <Ionicons
                                name="chevron-down"
                                size={20}
                                color={theme.textSecondary}
                            />
                        </TouchableOpacity>

                        {errors.municipalityId && (
                            <ErrorDisplay message="Please select a municipality" />
                        )}

                        {serverError && (
                            <ErrorDisplay message={serverError} />
                        )}

                        <ThemedButton
                            title={
                                isSubmitting
                                    ? "Creating Account..."
                                    : "Sign Up"
                            }
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            size="md"
                        />

                        {/* Login Link */}
                        <View style={styles.loginRow}>
                            <ThemedText variant="secondary">
                                Already have an account?
                            </ThemedText>

                            <TouchableOpacity
                                onPress={() =>
                                    router.push("/(auth)/login")
                                }
                                disabled={isSubmitting}
                            >
                                <ThemedText
                                    style={{
                                        color: theme.primary,
                                        fontWeight: "600",
                                    }}
                                >
                                    Sign In
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Municipality Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContainer,
                            { backgroundColor: theme.background },
                        ]}
                    >
                        <FlatList
                            data={municipalities}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() =>
                                        handleSelectMunicipality(item)
                                    }
                                    style={[
                                        styles.municipalityItem,
                                        {
                                            borderBottomColor:
                                                theme.border,
                                        },
                                    ]}
                                >
                                    <ThemedText>
                                        {item.name}
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
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
        paddingVertical: 40,
    },
    animatedContainer: {},
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    backButton: {
        position: "absolute",
        left: 0,
        top: -10,
        padding: 8,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        marginTop: 4,
        fontSize: 14,
    },
    municipalityPicker: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
    },
    locationIcon: {
        marginRight: 12,
    },
    loginRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        gap: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "80%",
    },
    municipalityItem: {
        padding: 20,
        borderBottomWidth: 1,
    },
});