import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useThemeColor } from "@app/hooks/use-theme-color";
import {
    ThemedScreenWrapper,
    ThemedView,
    ThemedText,
    ThemedInput,
    ThemedButton,
} from "@app/components/ui";
import { useAuth } from "@app/contexts/auth.context";
import { useMediaUpload } from "@app/hooks/use-media-upload";
import { userService } from "@app/services/user.service";
import { UserProfileUpdate } from "@app/types/user";

export default function EditProfileScreen() {
    const theme = useThemeColor();
    const router = useRouter();
    const { user, updateProfile } = useAuth();

    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>(undefined);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [municipalityName, setMunicipalityName] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { uploadSingleMedia } = useMediaUpload({
        context: "profile",
        onSuccess: (fileUrl) => {
            setProfileImage(fileUrl);
        },
        showAlerts: true,
    });

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || "");
            setPhoneNumber(user.phoneNumber || undefined);
            setProfileImage(user.profileImage || null);
            setMunicipalityName(user.municipalityName || "");
        }
    }, [user]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!fullName.trim()) {
            newErrors.fullName = "Full name is required";
        } else if (fullName.length > 255) {
            newErrors.fullName = "Full name cannot exceed 255 characters";
        }

        if (phoneNumber && !/^(\+\d{1,3}[- ]?)?\d{7,15}$/.test(phoneNumber)) {
            newErrors.phoneNumber = "Invalid phone number format";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        if (user) {
            setSaving(true);
            try {
                const updateData: UserProfileUpdate = {
                    fullName: fullName.trim(),
                    phoneNumber: phoneNumber,
                    profileImage: profileImage,
                };

                const updatedUser = await userService.updateProfile(user?.id, updateData);
                await updateProfile(updatedUser);

                Alert.alert("Success", "Profile updated successfully", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } catch (error) {
                console.error("Failed to update profile:", error);
            } finally {
                setSaving(false);
            }
        }
    };

    const handleChangeProfileImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert("Permission needed", "Please grant permission to access your photos");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadSingleMedia(result.assets[0]);
        }
    };

    const handleRemoveProfileImage = () => {
        Alert.alert(
            "Remove Profile Image",
            "Are you sure you want to remove your profile image?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => setProfileImage(""),
                },
            ]
        );
    };

    return (
        <ThemedScreenWrapper>
            <ThemedView variant="default" style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <ThemedText
                        variant="primary"
                        weight="bold"
                        size="lg"
                        style={styles.headerTitle}
                        numberOfLines={1}
                    >
                        Edit Profile
                    </ThemedText>
                    <View style={{ width: 32 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.container}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Profile Image Section */}
                        <ThemedView style={styles.profileImageCard}>
                            <View style={styles.profileImageContainer}>
                                {profileImage ? (
                                    <TouchableOpacity
                                        onPress={handleChangeProfileImage}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.imageWrapper}>
                                            <Image
                                                source={{ uri: profileImage }}
                                                style={styles.profileImage}
                                            />
                                            <View style={styles.imageOverlay}>
                                                <Ionicons name="camera" size={24} color="#fff" />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleChangeProfileImage}
                                        style={[
                                            styles.profileImagePlaceholder,
                                            { backgroundColor: theme.primary + "20" },
                                        ]}
                                    >
                                        <Ionicons name="person" size={50} color={theme.primary} />
                                        <View style={styles.cameraIcon}>
                                            <Ionicons name="camera" size={20} color="#fff" />
                                        </View>
                                    </TouchableOpacity>
                                )}

                                {profileImage && (
                                    <TouchableOpacity
                                        onPress={handleRemoveProfileImage}
                                        style={styles.removeImageButton}
                                    >
                                        <Ionicons name="close-circle" size={28} color={theme.danger} />
                                    </TouchableOpacity>
                                )}

                                {/* {isUploading && (
                                    <View style={styles.uploadingOverlay}>
                                        <ActivityIndicator size="small" color="#fff" />
                                    </View>
                                )} */}
                            </View>
                            <ThemedText variant="secondary" size="xs" style={styles.imageHint}>
                                Tap to change profile picture
                            </ThemedText>
                        </ThemedView>

                        {/* Form Fields */}
                        <ThemedView style={styles.formCard}>
                            {/* Email */}
                            <View style={styles.fieldContainer}>
                                <ThemedText variant="secondary" size="sm" style={styles.label}>
                                    Email
                                </ThemedText>
                                <View
                                    style={[
                                        styles.readOnlyField,
                                        { backgroundColor: theme.inputBackground, borderColor: theme.border },
                                    ]}
                                >
                                    <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
                                    <ThemedText variant="secondary" style={styles.readOnlyText}>
                                        {user?.email}
                                    </ThemedText>
                                </View>
                            </View>

                            {/* Full Name */}
                            <View style={styles.fieldContainer}>
                                <ThemedText variant="secondary" size="sm" style={styles.label}>
                                    Full Name <ThemedText variant="danger">*</ThemedText>
                                </ThemedText>
                                <ThemedInput
                                    icon="person-outline"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    error={errors.fullName}
                                />
                            </View>

                            {/* Phone Number */}
                            <View style={styles.fieldContainer}>
                                <ThemedText variant="secondary" size="sm" style={styles.label}>
                                    Phone Number
                                </ThemedText>
                                <ThemedInput
                                    icon="call-outline"
                                    placeholder="+63 XXX XXX XXXX"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    error={errors.phoneNumber}
                                />
                            </View>

                            {/* Municipality */}
                            <View style={styles.fieldContainer}>
                                <ThemedText variant="secondary" size="sm" style={styles.label}>
                                    Municipality
                                </ThemedText>
                                <View
                                    style={[
                                        styles.readOnlyField,
                                        { backgroundColor: theme.inputBackground, borderColor: theme.border },
                                    ]}
                                >
                                    <Ionicons name="location-outline" size={20} color={theme.textSecondary} />
                                    <ThemedText variant="secondary" style={styles.readOnlyText}>
                                        {municipalityName || "Not assigned"}
                                    </ThemedText>
                                </View>
                            </View>

                            {/* Role (Read-only) */}
                            <View style={styles.fieldContainer}>
                                <ThemedText variant="secondary" size="sm" style={styles.label}>
                                    Role
                                </ThemedText>
                                <View
                                    style={[
                                        styles.readOnlyField,
                                        { backgroundColor: theme.inputBackground, borderColor: theme.border },
                                    ]}
                                >
                                    <Ionicons name="shield-outline" size={20} color={theme.textSecondary} />
                                    <ThemedText variant="secondary" style={styles.readOnlyText}>
                                        {user?.role?.replace("_", " ").toLowerCase() || "User"}
                                    </ThemedText>
                                </View>
                            </View>
                        </ThemedView>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <ThemedButton
                                title="Cancel"
                                variant="outline"
                                size="md"
                                onPress={() => router.back()}
                                style={styles.cancelButton}
                            />
                            <ThemedButton
                                title={saving ? "Saving..." : "Save Changes"}
                                variant="primary"
                                size="md"
                                onPress={handleSave}
                                disabled={saving}
                                style={styles.saveButton}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ThemedView>
        </ThemedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: { marginRight: 12, padding: 4 },
    headerTitle: { flex: 1 },
    container: {
        padding: 20,
        paddingBottom: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    profileImageCard: {
        marginBottom: 20,
        padding: 20,
        alignItems: "center",
    },
    profileImageContainer: {
        position: "relative",
        alignItems: "center",
    },
    imageWrapper: {
        position: "relative",
        borderRadius: 60,
        overflow: "hidden",
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    imageOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 60,
    },
    profileImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    cameraIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#4CAF50",
        borderRadius: 20,
        padding: 6,
    },
    removeImageButton: {
        position: "absolute",
        top: -10,
        right: -10,
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
    },
    uploadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    imageHint: {
        marginTop: 12,
        textAlign: "center",
    },
    formCard: {
        marginBottom: 20,
        padding: 16,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontWeight: "500",
    },
    readOnlyField: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    readOnlyText: {
        flex: 1,
        fontSize: 16,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
});