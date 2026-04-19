import React, { useRef } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
    View,
    Linking,
    Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useThemeColor } from "@app/hooks/use-theme-color";
import { useTheme } from "@app/contexts/theme.context";
import {
    ThemedScreenWrapper,
    ThemedView,
    ThemedText,
    ThemedDivider,
} from "@app/components/ui";
import { useAuth } from "@app/contexts/auth.context";
import { Radius } from "@app/constants/theme";
import { useNotifications } from "@app/hooks/use-notifications";

export default function SettingsPage() {
    const theme = useThemeColor();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { themeMode, setThemeMode } = useTheme();
    const scrollY = useRef(new Animated.Value(0)).current;
    const {
        notificationsEnabled,
        toggleNotifications,
        hasPermission
    } = useNotifications(user?.id);

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.95],
        extrapolate: "clamp",
    });

    const handleToggleNotifications = async (value: boolean) => {
        if (value && !hasPermission) {
            Alert.alert(
                "Permission Required",
                "Please grant notification permission in your device settings to receive alerts.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Settings", onPress: () => Linking.openSettings() }
                ]
            );
            return;
        }

        try {
            await toggleNotifications(value);
        } catch (error) {
            console.log(error);
        }
    };

    const handleThemeChange = (mode: "light" | "dark" | "system") => {
        setThemeMode(mode);
    };

    const renderOption = (
        icon: keyof typeof Ionicons.glyphMap,
        label: string,
        onPress: () => void,
        danger?: boolean,
    ) => (
        <TouchableOpacity style={styles.optionItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: danger ? theme.danger + "15" : theme.primary + "15" }]}>
                    <Ionicons name={icon} size={18} color={danger ? theme.danger : theme.primary} />
                </View>
                <ThemedText
                    variant={danger ? "danger" : "primary"}
                    weight="medium"
                    style={styles.optionLabel}
                >
                    {label}
                </ThemedText>
            </View>

            {!danger && <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
        </TouchableOpacity>
    );

    const renderSwitchOption = (
        icon: keyof typeof Ionicons.glyphMap,
        label: string,
        value: boolean,
        onValueChange: (value: boolean) => void,
        description?: string,
    ) => (
        <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + "15" }]}>
                    <Ionicons name={icon} size={18} color={theme.primary} />
                </View>
                <View style={styles.optionTextContainer}>
                    <ThemedText weight="medium" style={styles.optionLabel}>
                        {label}
                    </ThemedText>
                    {description && (
                        <ThemedText variant="secondary" size="xs" style={styles.optionDescription}>
                            {description}
                        </ThemedText>
                    )}
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={value ? "#FFFFFF" : "#f4f3f4"}
                ios_backgroundColor={theme.border}
            />
        </View>
    );

    const renderThemeOption = () => {
        const getThemeIcon = () => {
            if (themeMode === "dark") return "moon";
            if (themeMode === "light") return "sunny";
            return "phone-portrait-outline";
        };

        const getThemeLabel = () => {
            if (themeMode === "dark") return "Dark Mode";
            if (themeMode === "light") return "Light Mode";
            return "Use System Theme";
        };

        return (
            <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                    Alert.alert(
                        "Theme Settings",
                        "Choose your preferred theme",
                        [
                            {
                                text: "Light Mode",
                                onPress: () => handleThemeChange("light"),
                            },
                            {
                                text: "Dark Mode",
                                onPress: () => handleThemeChange("dark"),
                            },
                            {
                                text: "Use System",
                                onPress: () => handleThemeChange("system"),
                            },
                            { text: "Cancel", style: "cancel" }
                        ]
                    );
                }}
                activeOpacity={0.7}
            >
                <View style={styles.optionLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + "15" }]}>
                        <Ionicons name={getThemeIcon()} size={18} color={theme.primary} />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <ThemedText weight="medium" style={styles.optionLabel}>
                            Theme
                        </ThemedText>
                        <ThemedText variant="secondary" size="xs" style={styles.optionDescription}>
                            {getThemeLabel()}
                        </ThemedText>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
        );
    };

    return (
        <ThemedScreenWrapper>
            <ThemedView variant="default" style={{ flex: 1 }}>
                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.container}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {/* Animated Header */}
                    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                        <ThemedText variant="primary" size="xl" weight="bold" style={styles.title}>
                            Settings
                        </ThemedText>
                    </Animated.View>

                    {/* Profile Section */}
                    <ThemedView style={styles.profileCard}>
                        <TouchableOpacity
                            onPress={() => router.push("/profile/edit")}
                            style={styles.avatarContainer}
                            activeOpacity={0.8}
                        >
                            {user?.profileImage ? (
                                <Image source={{ uri: user.profileImage }} style={styles.avatar} />
                            ) : (
                                <View
                                    style={[
                                        styles.avatar,
                                        styles.avatarPlaceholder,
                                        { backgroundColor: theme.primary + "20" },
                                    ]}
                                >
                                    <Ionicons name="person" size={32} color={theme.primary} />
                                </View>
                            )}
                            <View style={[styles.editAvatarBadge, { backgroundColor: theme.primary }]}>
                                <Ionicons name="camera" size={14} color="#FFF" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.profileInfo}>
                            <ThemedText
                                variant="primary"
                                weight="bold"
                                size="lg"
                                style={styles.name}
                            >
                                {user?.fullName || "User"}
                            </ThemedText>
                            <ThemedText variant="secondary" size="sm" style={styles.email}>
                                {user?.email || "Email"}
                            </ThemedText>
                            <View
                                style={[
                                    styles.roleBadge,
                                    { backgroundColor: theme.primary + "15" },
                                ]}
                            >
                                <ThemedText
                                    variant="primary"
                                    size="xs"
                                    weight="semibold"
                                    style={{ color: theme.primary }}
                                >
                                    {user?.role?.replace("_", " ").toLowerCase() || "User"}
                                </ThemedText>
                            </View>
                        </View>
                    </ThemedView>

                    {/* Account Section */}
                    <ThemedText
                        variant="secondary"
                        size="sm"
                        weight="semibold"
                        style={styles.sectionTitle}
                    >
                        Account
                    </ThemedText>

                    <ThemedView style={styles.sectionCard}>
                        {renderOption("person-outline", "Edit Profile", () =>
                            router.push("/profile/edit"),
                        )}
                        <ThemedDivider inset={true} insetLeft={50} />
                        {renderOption("lock-closed-outline", "Change Password", () =>
                            router.push("/profile/change-password"),
                        )}
                    </ThemedView>

                    {/* Preferences Section */}
                    <ThemedText
                        variant="secondary"
                        size="sm"
                        weight="semibold"
                        style={styles.sectionTitle}
                    >
                        Preferences
                    </ThemedText>

                    <ThemedView style={styles.sectionCard}>
                        {renderSwitchOption(
                            "notifications-outline",
                            "Push Notifications",
                            notificationsEnabled,
                            handleToggleNotifications,
                            !hasPermission
                                ? "Permission not granted"
                                : notificationsEnabled
                                    ? "Receive alerts and updates"
                                    : "Notifications are off"
                        )}
                        <ThemedDivider inset={true} insetLeft={50} />
                        {renderThemeOption()}
                    </ThemedView>

                    {/* Logout Section */}
                    <ThemedView style={styles.logoutCard}>
                        {renderOption(
                            "log-out-outline",
                            "Logout",
                            () =>
                                Alert.alert(
                                    "Logout",
                                    "Are you sure you want to logout?",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                            text: "Logout",
                                            style: "destructive",
                                            onPress: () => logout(),
                                        },
                                    ]
                                ),
                            true,
                        )}
                    </ThemedView>

                    {/* Version Info */}
                    <View style={styles.versionContainer}>
                        <ThemedText variant="secondary" size="xs" style={styles.versionText}>
                            Version 1.0.0
                        </ThemedText>
                    </View>
                </Animated.ScrollView>
            </ThemedView>
        </ThemedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },

    header: {
        marginBottom: 20,
    },

    title: {
        marginBottom: 0,
    },

    profileCard: {
        flexDirection: "row",
        padding: 20,
        marginBottom: 24,
        alignItems: "center",
        gap: 16,
    },

    avatarContainer: {
        position: "relative",
    },

    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },

    avatarPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },

    editAvatarBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFF",
    },

    profileInfo: {
        flex: 1,
        gap: 4,
    },

    name: {
        marginBottom: 2,
    },

    email: {
        opacity: 0.8,
    },

    roleBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: Radius.sm,
        marginTop: 6,
    },

    sectionTitle: {
        marginBottom: 8,
        marginTop: 8,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },

    sectionCard: {
        marginBottom: 16,
        overflow: "hidden",
    },

    logoutCard: {
        marginBottom: 16,
        overflow: "hidden",
    },

    optionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
    },

    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },

    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },

    optionTextContainer: {
        flex: 1,
        gap: 1,
    },

    optionLabel: {
        fontSize: 14,
    },

    optionDescription: {
        fontSize: 11,
        lineHeight: 14,
        opacity: 0.7,
    },

    versionContainer: {
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 10,
    },

    versionText: {
        opacity: 0.5,
        marginBottom: 50
    },
});