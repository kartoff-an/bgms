import React from "react";
import { View, StyleSheet, Modal, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Geosite } from "@app/types/geosite";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedText, ThemedCard } from "@app/components/ui";
import { Radius, Elevation } from "@app/constants/theme";

interface GeositeDetailModalProps {
    visible: boolean;
    geosite: Geosite | null;
    onClose: () => void;
}

export function GeositeDetailModal({ visible, geosite, onClose }: GeositeDetailModalProps) {
    const theme = useThemeColor();

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "good":
                return theme.success;
            case "monitoring":
                return theme.warning;
            case "critical":
                return theme.danger;
            default:
                return theme.textSecondary;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case "good":
                return "checkmark-circle";
            case "monitoring":
                return "alert-circle";
            case "critical":
                return "warning";
            default:
                return "help-circle";
        }
    };

    if (!geosite) return null;

    const InfoCard = ({
        title,
        value,
        full = false,
    }: {
        title: string;
        value: string;
        full?: boolean;
    }) => (
        <ThemedCard
            variant="outlined"
            radius="md"
            style={[styles.infoCard, { flex: full ? 1 : 0.5 }]}
        >
            <ThemedText variant="secondary" size="xs" weight="semibold" style={styles.infoTitle}>
                {title}
            </ThemedText>
            <ThemedText variant="primary" size="sm" weight="medium" style={styles.infoValue}>
                {value}
            </ThemedText>
        </ThemedCard>
    );

    const handleViewReports = () => {
        onClose();
        router.push({
            pathname: "/(app)/(tabs)/community-feed",
            params: {
                geositeId: geosite.id,
                geositeName: geosite.name,
                filterByGeosite: "true",
            },
        });
    };

    const handleViewMap = () => {
        onClose();
        router.push({
            pathname: "/(app)/(tabs)/maps",
            params: {
                geositeId: geosite.id,
                latitude: geosite.latitude?.toString(),
                longitude: geosite.longitude?.toString(),
                geositeName: geosite.name,
            },
        });
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
                <View style={[styles.container, { backgroundColor: theme.background }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.border }]}>
                        <ThemedText
                            variant="primary"
                            weight="bold"
                            size="lg"
                            style={styles.title}
                            numberOfLines={1}
                        >
                            {geosite.name}
                        </ThemedText>

                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.closeButton, { backgroundColor: theme.surface }]}
                        >
                            <Ionicons name="close" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Image */}
                        {geosite.coverPhotoUrl ? (
                            <Image
                                source={{ uri: geosite.coverPhotoUrl }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : (
                            <View
                                style={[
                                    styles.image,
                                    styles.placeholder,
                                    { backgroundColor: theme.surface },
                                ]}
                            >
                                <Ionicons name="image-outline" size={50} color={theme.textSecondary} />
                            </View>
                        )}

                        <View style={styles.body}>
                            {/* Status Badge */}
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(geosite.overallStatus) + "20" },
                                ]}
                            >
                                <Ionicons
                                    name={getStatusIcon(geosite.overallStatus)}
                                    size={16}
                                    color={getStatusColor(geosite.overallStatus)}
                                />
                                <ThemedText
                                    size="sm"
                                    weight="semibold"
                                    style={{ color: getStatusColor(geosite.overallStatus) }}
                                >
                                    {geosite.overallStatus || "Unknown"}
                                </ThemedText>
                            </View>

                            {/* Description */}
                            {geosite.description && (
                                <ThemedCard variant="outlined" radius="md" style={styles.section}>
                                    <ThemedText variant="secondary" size="xs" weight="semibold" style={styles.sectionTitle}>
                                        Description
                                    </ThemedText>
                                    <ThemedText variant="primary" size="sm" style={styles.description}>
                                        {geosite.description}
                                    </ThemedText>
                                </ThemedCard>
                            )}

                            {/* Overview Section */}
                            <ThemedText variant="secondary" size="xs" weight="semibold" style={styles.groupTitle}>
                                Overview
                            </ThemedText>

                            <View style={styles.infoRow}>
                                <InfoCard title="Type" value={geosite.typeName || geosite.typeId} />
                                <InfoCard
                                    title="Municipality"
                                    value={geosite.municipalityName || geosite.municipalityId}
                                />
                            </View>

                            {/* Location Section */}
                            {(geosite.geofenceRadius || (geosite.latitude && geosite.longitude)) && (
                                <>
                                    <ThemedText variant="secondary" size="xs" weight="semibold" style={styles.groupTitle}>
                                        Location
                                    </ThemedText>

                                    {geosite.geofenceRadius && geosite.latitude && geosite.longitude ? (
                                        <View style={styles.infoRow}>
                                            <InfoCard title="Geofence" value={`${geosite.geofenceRadius} m`} />
                                            <InfoCard
                                                title="Coordinates"
                                                value={`${geosite.latitude.toFixed(6)}, ${geosite.longitude.toFixed(6)}`}
                                            />
                                        </View>
                                    ) : (
                                        <>
                                            {geosite.geofenceRadius && (
                                                <InfoCard title="Geofence Radius" value={`${geosite.geofenceRadius} meters`} full />
                                            )}
                                            {geosite.latitude && geosite.longitude && (
                                                <InfoCard
                                                    title="Coordinates"
                                                    value={`${geosite.latitude.toFixed(6)}, ${geosite.longitude.toFixed(6)}`}
                                                    full
                                                />
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {/* Details Section */}
                            {(geosite.culturalSignificance || geosite.baselineCondition) && (
                                <>
                                    <ThemedText variant="secondary" size="xs" weight="semibold" style={styles.groupTitle}>
                                        Details
                                    </ThemedText>

                                    {geosite.culturalSignificance && (
                                        <InfoCard title="Cultural Significance" value={geosite.culturalSignificance} full />
                                    )}
                                    {geosite.baselineCondition && (
                                        <InfoCard title="Baseline Condition" value={geosite.baselineCondition} full />
                                    )}
                                </>
                            )}

                            {/* Metadata Section */}
                            <ThemedText variant="secondary" size="xs" weight="semibold" style={styles.groupTitle}>
                                Metadata
                            </ThemedText>

                            <View style={styles.infoRow}>
                                <InfoCard
                                    title="Created"
                                    value={new Date(geosite.createdAt).toLocaleDateString()}
                                />
                                <InfoCard
                                    title="Updated"
                                    value={new Date(geosite.updatedAt).toLocaleDateString()}
                                />
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                                    onPress={handleViewReports}
                                >
                                    <Ionicons name="document-text" size={20} color="#fff" />
                                    <ThemedText size="sm" weight="semibold" style={{ color: "#fff" }}>
                                        View Reports
                                    </ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.secondaryButton, { borderColor: theme.primary }]}
                                    onPress={handleViewMap}
                                >
                                    <Ionicons name="map" size={20} color={theme.primary} />
                                    <ThemedText size="sm" weight="semibold" style={{ color: theme.primary }}>
                                        View Map
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },

    container: {
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        maxHeight: "92%",
        overflow: "hidden",
        ...Elevation.lg,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        borderBottomWidth: 1,
    },

    title: {
        flex: 1,
        marginRight: 12,
    },

    closeButton: {
        padding: 8,
        borderRadius: Radius.sm,
    },

    scrollContent: {
        paddingBottom: 20,
    },

    image: {
        width: "100%",
        height: 200,
    },

    placeholder: {
        justifyContent: "center",
        alignItems: "center",
    },

    body: {
        padding: 20,
        gap: 14,
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.lg,
        gap: 6,
    },

    section: {
        padding: 14,
    },

    sectionTitle: {
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    description: {
        lineHeight: 22,
    },

    groupTitle: {
        marginTop: 8,
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    infoRow: {
        flexDirection: "row",
        gap: 12,
    },

    infoCard: {
        padding: 14,
    },

    infoTitle: {
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    infoValue: {
        lineHeight: 20,
    },

    actions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
        marginBottom: 10,
    },

    primaryButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 14,
        borderRadius: Radius.md,
        gap: 8,
        ...Elevation.sm,
    },

    secondaryButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 14,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        gap: 8,
    },
});