import { useThemeColor } from "@app/hooks/use-theme-color";
import { MonitoringReport, ReportStatus } from "@app/types/report";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ThemedCard, ThemedText } from "../ui";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Radius } from "@app/constants/theme";

export default function ReportCard({
    report,
    showValidationHint = false,
}: {
    report: MonitoringReport;
    showValidationHint?: boolean;
}) {
    const theme = useThemeColor();

    const statusColors: Record<ReportStatus, string> = {
        [ReportStatus.PENDING]: theme.warning,
        [ReportStatus.UNDER_REVIEW]: theme.info,
        [ReportStatus.REVIEWED]: theme.success,
        [ReportStatus.REJECTED]: theme.danger,
        [ReportStatus.WITHDRAWN]: theme.textSecondary,
    };

    const getStatusLabel = (status: ReportStatus) => {
        return status.replace("_", " ").toLowerCase();
    };

    const relativeDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <ThemedCard
            variant={
                showValidationHint && report.reportStatus === ReportStatus.PENDING
                    ? "elevated"
                    : "outlined"
            }
            style={[
                styles.card,
                showValidationHint &&
                    report.reportStatus === ReportStatus.PENDING && {
                        borderWidth: 2,
                        borderColor: theme.primary,
                    },
            ]}
        >
            <View style={styles.cardHeader}>
                <ThemedText variant="primary" weight="bold" size="md" style={styles.cardTitle}>
                    {report.damageType}
                </ThemedText>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: statusColors[report.reportStatus] },
                    ]}
                >
                    <ThemedText variant="primary" size="xs" weight="bold" style={styles.statusText}>
                        {getStatusLabel(report.reportStatus)}
                    </ThemedText>
                </View>
            </View>

            <ThemedText
                variant="secondary"
                size="sm"
                style={styles.cardDescription}
                numberOfLines={2}
            >
                {report.damageDescription}
            </ThemedText>

            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <Ionicons name="leaf-outline" size={16} color={theme.primary} />
                    <ThemedText variant="secondary" size="xs" style={styles.footerText}>
                        {report.geositeName || "Unknown geosite"}
                    </ThemedText>
                </View>

                <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                    <ThemedText variant="secondary" size="xs" style={styles.footerText}>
                        {relativeDate(report.createdAt)}
                    </ThemedText>
                </View>
            </View>

            {showValidationHint && report.reportStatus === ReportStatus.PENDING && (
                <View style={[styles.validationBadge, { backgroundColor: theme.primary + "20" }]}>
                    <Ionicons name="shield-checkmark" size={14} color={theme.primary} />
                    <ThemedText
                        variant="primary"
                        size="xs"
                        weight="medium"
                        style={[styles.validationText, { color: theme.primary }]}
                    >
                        Tap to validate this report
                    </ThemedText>
                </View>
            )}
        </ThemedCard>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 14,
        padding: 16,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    cardTitle: {
        flex: 1,
        marginRight: 8,
    },

    statusBadge: {
        borderRadius: Radius.sm,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    statusText: {
        color: "#fff",
        textTransform: "capitalize",
    },

    cardDescription: {
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
    },

    footerText: {
        marginLeft: 4,
    },

    validationBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 8,
        marginTop: 12,
        borderRadius: Radius.sm,
    },

    validationText: {
        fontWeight: "500",
    },
});
