import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Geosite } from "@app/types/geosite";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { getGeositeStatusColor } from "@app/utils/color";

interface GeositeCardProps {
    geosite: Geosite;
    onPress: (geosite: Geosite) => void;
}

export function GeositeCard({ geosite, onPress }: GeositeCardProps) {
    const theme = useThemeColor();

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
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

    return (
        <TouchableOpacity
            style={[styles.geositeCard, { backgroundColor: theme.card }]}
            onPress={() => onPress(geosite)}
            activeOpacity={0.7}
        >
            {geosite.coverPhotoUrl ? (
                <Image source={{ uri: geosite.coverPhotoUrl }} style={styles.cardImage} />
            ) : (
                <View
                    style={[
                        styles.cardImage,
                        styles.placeholderImage,
                        { backgroundColor: `${theme.primary}10` },
                    ]}
                >
                    <Ionicons name="image" size={40} color={theme.primary} />
                </View>
            )}

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text
                        style={[styles.geositeName, { color: theme.textPrimary }]}
                        numberOfLines={1}
                    >
                        {geosite.name}
                    </Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getGeositeStatusColor(geosite.overallStatus) },
                        ]}
                    >
                        <Ionicons
                            name={getStatusIcon(geosite.overallStatus)}
                            size={12}
                            color="white"
                        />
                        <Text style={styles.statusText}>{geosite.overallStatus}</Text>
                    </View>
                </View>

                <Text style={[styles.geositeType, { color: theme.primary }]}>
                    {geosite.typeName}
                </Text>

                {geosite.description && (
                    <Text
                        style={[styles.geositeDescription, { color: theme.textSecondary }]}
                        numberOfLines={2}
                    >
                        {geosite.description}
                    </Text>
                )}

                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Ionicons name="location" size={14} color={theme.textSecondary} />
                        <Text
                            style={[styles.footerText, { color: theme.textSecondary }]}
                            numberOfLines={1}
                        >
                            {geosite.municipalityName || geosite.municipalityId}
                        </Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Ionicons name="time" size={14} color={theme.textSecondary} />
                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                            {new Date(geosite.updatedAt).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    geositeCard: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardImage: {
        width: "100%",
        height: 150,
    },
    placeholderImage: {
        justifyContent: "center",
        alignItems: "center",
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    geositeName: {
        fontSize: 18,
        fontWeight: "600",
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        gap: 4,
    },
    statusText: {
        color: "white",
        fontSize: 11,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    geositeType: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 6,
    },
    geositeDescription: {
        fontSize: 13,
        marginBottom: 12,
        lineHeight: 18,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flex: 1,
        marginRight: 8,
    },
    footerText: {
        fontSize: 12,
    },
});
