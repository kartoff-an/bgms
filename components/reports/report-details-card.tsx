import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedCard, ThemedText } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { Geosite } from "@app/types/geosite";

interface ReportDetailsCardProps {
    damageType?: string;
    reportType?: string;
    createdAt?: string;
    validationDate?: string;
    validatorName?: string;
    geosite?: Geosite | null;
    loadingGeosite?: boolean;
    submitterId?: string;
}

export const ReportDetailsCard: React.FC<ReportDetailsCardProps> = ({
    damageType,
    reportType,
    createdAt,
    validationDate,
    validatorName,
    geosite,
    loadingGeosite = false,
    submitterId,
}) => {
    const theme = useThemeColor();

    const DetailRow = ({ icon, label, value, loading = false, warning = false }: any) => (
        <View style={styles.detailRow}>
            <Ionicons name={icon} size={18} color={warning ? theme.warning : theme.textSecondary} />
            <ThemedText variant="secondary" size="sm" weight="medium" style={styles.detailLabel}>
                {label}:
            </ThemedText>
            {loading ? (
                <ActivityIndicator size="small" color={theme.primary} />
            ) : (
                <ThemedText
                    variant={warning ? "warning" : "primary"}
                    size="sm"
                    style={styles.detailValue}
                >
                    {value || "Unknown"}
                </ThemedText>
            )}
        </View>
    );

    return (
        <ThemedCard variant="outlined" style={styles.card}>
            <View style={styles.header}>
                <Ionicons name="document-text-outline" size={20} color={theme.primary} />
                <ThemedText variant="primary" weight="semibold" size="md">
                    Report Details
                </ThemedText>
            </View>

            <View style={styles.content}>
                <DetailRow icon="warning-outline" label="Damage Type" value={damageType} />
                <DetailRow icon="leaf-outline" label="Report Type" value={reportType} />

                {submitterId && (
                    <DetailRow
                        icon="person-outline"
                        label="Reported By"
                        value={`User ID: ${submitterId}`}
                    />
                )}

                <DetailRow
                    icon="location-outline"
                    label="Geosite"
                    value={geosite?.name}
                    loading={loadingGeosite}
                    warning={!geosite && !loadingGeosite}
                />

                <DetailRow
                    icon="calendar-outline"
                    label="Created"
                    value={createdAt ? new Date(createdAt).toLocaleString() : undefined}
                />

                {validationDate && (
                    <DetailRow
                        icon="checkmark-done-outline"
                        label="Validated"
                        value={new Date(validationDate).toLocaleString()}
                    />
                )}

                {validatorName && (
                    <DetailRow icon="person-outline" label="Validator" value={validatorName} />
                )}
            </View>
        </ThemedCard>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 20,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
    },
    content: {
        gap: 12,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
    },
    detailLabel: {
        marginLeft: 4,
        minWidth: 85,
    },
    detailValue: {
        flex: 1,
    },
});
