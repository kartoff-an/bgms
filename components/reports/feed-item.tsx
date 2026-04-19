import { useThemeColor } from "@app/hooks/use-theme-color";
import { MonitoringReport } from "@app/types/report";
import { format } from "date-fns";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { ThemedCard, ThemedText } from "../ui";
import { Ionicons } from "@expo/vector-icons";
import { Radius } from "@app/constants/theme";

interface FeedItemProps {
    report: MonitoringReport;
    onPress: () => void;
    isLast?: boolean;
}

export default function FeedItem({ report, onPress, isLast }: FeedItemProps) {
    const theme = useThemeColor();

    const formatRelativeDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return "Just now";
        if (diffHours < 24) return `${diffHours}h ago`;
        return format(date, "MMM d");
    };

    const getDamageTypeIcon = (damageType: string) => {
        const type = damageType?.toLowerCase() || "";
        if (type.includes("erosion")) return "trending-down-outline";
        if (type.includes("pollution")) return "warning-outline";
        if (type.includes("deforestation")) return "leaf-outline";
        if (type.includes("construction")) return "construct-outline";
        return "alert-circle-outline";
    };

    const getDamageTypeColor = (damageType: string) => {
        const type = damageType?.toLowerCase() || "";
        if (type.includes("erosion")) return theme.warning;
        if (type.includes("pollution")) return theme.danger;
        if (type.includes("deforestation")) return theme.success;
        return theme.primary;
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[styles.feedItemWrapper, !isLast && { marginBottom: 16 }]}
        >
            <ThemedCard variant="outlined" radius="lg" style={styles.feedCard}>
                {/* Header */}
                <View style={styles.feedHeader}>
                    <View style={[styles.damageTypeBadge, { backgroundColor: getDamageTypeColor(report.damageType) + "15" }]}>
                        <Ionicons
                            name={getDamageTypeIcon(report.damageType)}
                            size={16}
                            color={getDamageTypeColor(report.damageType)}
                        />
                        <ThemedText
                            size="xs"
                            weight="semibold"
                            style={[styles.damageTypeText, { color: getDamageTypeColor(report.damageType) }]}
                        >
                            {report.damageType || "Environmental Issue"}
                        </ThemedText>
                    </View>
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} />
                        <ThemedText variant="secondary" size="xs">
                            {formatRelativeDate(report.createdAt)}
                        </ThemedText>
                    </View>
                </View>

                {/* Description */}
                <ThemedText
                    variant="primary"
                    size="md"
                    weight="medium"
                    numberOfLines={2}
                    style={styles.description}
                >
                    {report.damageDescription}
                </ThemedText>

                {/* Location */}
                <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color={theme.primary} />
                    <ThemedText variant="secondary" size="xs" style={styles.locationText}>
                        {report.geositeName || "Geopark Area"}
                    </ThemedText>
                </View>

                {/* Footer Stats */}
                <View style={styles.footerStats}>
                    <View style={styles.stat}>
                        <Ionicons name="chatbubble-outline" size={14} color={theme.textSecondary} />
                        <ThemedText variant="secondary" size="xs">
                            {report.timelines?.length || 0} updates
                        </ThemedText>
                    </View>
                    <View style={styles.stat}>
                        <Ionicons name="images-outline" size={14} color={theme.textSecondary} />
                        <ThemedText variant="secondary" size="xs">
                            {report.medias?.length || 0} photos
                        </ThemedText>
                    </View>
                    <View style={[styles.verifiedBadge, { backgroundColor: theme.success + "15" }]}>
                        <Ionicons name="checkmark-circle" size={12} color={theme.success} />
                        <ThemedText size="xs" style={{ color: theme.success }}>
                            Verified
                        </ThemedText>
                    </View>
                </View>
            </ThemedCard>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    feedItemWrapper: {
        marginBottom: 16,
    },
    
    feedCard: {
        padding: 16,
    },

    feedHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    damageTypeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.sm,
    },

    damageTypeText: {
        fontSize: 11,
        fontWeight: "600",
        textTransform: "capitalize",
    },

    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    description: {
        lineHeight: 22,
        marginBottom: 12,
    },

    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
        paddingVertical: 4,
    },

    footerStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
    },

    stat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    verifiedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.sm,
        marginLeft: "auto",
    },

    locationText: {
        flex: 1,
    },
})