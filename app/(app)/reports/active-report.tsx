import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedScreenWrapper, ThemedView, ThemedText } from "@app/components/ui";
import { Timeline } from "@app/components/reports/timeline";
import { MediaGallery } from "@app/components/media/media-gallery";
import { ReportDetailsCard } from "@app/components/reports/report-details-card";
import { LocationMap } from "@app/components/map/location-map";
import { ReportActions } from "@app/components/reports/report-actions";

import { MonitoringReport } from "@app/types/report";
import { monitoringReportService } from "@app/services/report.service";
import { geositeService } from "@app/services/geosite.service";
import { Geosite } from "@app/types/geosite";
import { useAuth } from "@app/contexts/auth.context";
import { UserRole } from "@app/types/user";

export default function ActiveReportDetailScreen() {
    const theme = useThemeColor();
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const isOfficer = user?.role === UserRole.OFFICER;

    const [report, setReport] = useState<MonitoringReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [geosite, setGeosite] = useState<Geosite | null>(null);
    const [loadingGeosite, setLoadingGeosite] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const currentReport = await monitoringReportService.getById(id);
            setReport(currentReport);

            if (currentReport.geositeId) {
                setLoadingGeosite(true);
                const geositeData = await geositeService.getById(currentReport.geositeId);
                setGeosite(geositeData);
                setLoadingGeosite(false);
            }
        } catch (error) {
            console.error("Failed to fetch report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleActionComplete = () => {
        router.push("../reports");
    };

    if (loading || !report) {
        return (
            <ThemedScreenWrapper>
                <ThemedView variant="default" style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <ThemedText variant="secondary" style={{ marginTop: 12 }}>
                        Loading report...
                    </ThemedText>
                </ThemedView>
            </ThemedScreenWrapper>
        );
    }

    const getStatusColor = () => {
        switch (report.reportStatus) {
            case "PENDING":
                return theme.warning;
            case "UNDER_REVIEW":
                return theme.info;
            case "REVIEWED":
                return theme.success;
            case "REJECTED":
                return theme.danger;
            default:
                return theme.textSecondary;
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace("_", " ").toLowerCase();
    };

    return (
        <ThemedScreenWrapper>
            <ThemedView variant="default" style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.push("../reports")}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <ThemedText
                        variant="primary"
                        weight="bold"
                        size="lg"
                        style={styles.headerTitle}
                        numberOfLines={1}
                    >
                        {report.damageType || "Unknown"}
                    </ThemedText>
                </View>

                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                        <ThemedText
                            variant="primary"
                            size="xs"
                            weight="bold"
                            style={styles.statusText}
                        >
                            {getStatusLabel(report.reportStatus)}
                        </ThemedText>
                    </View>

                    {/* Report Details Card */}
                    <ReportDetailsCard
                        damageType={report.damageType}
                        reportType={report.reportType}
                        createdAt={report.createdAt}
                        validationDate={report.validationDate}
                        validatorName={report.validatorName}
                        geosite={geosite}
                        loadingGeosite={loadingGeosite}
                        submitterId={isOfficer ? report.submitterId : undefined}
                    />

                    {/* Description */}
                    <View style={styles.section}>
                        <ThemedText
                            variant="primary"
                            weight="semibold"
                            size="md"
                            style={styles.sectionTitle}
                        >
                            Description
                        </ThemedText>
                        <ThemedText variant="secondary" size="sm" style={styles.descriptionText}>
                            {report.damageDescription || "No description available."}
                        </ThemedText>
                    </View>

                    {/* Location Map */}
                    {typeof report.latitude === "number" &&
                        typeof report.longitude === "number" && (
                            <LocationMap latitude={report.latitude} longitude={report.longitude} />
                        )}

                    {/* Attached Images */}
                    <View style={styles.section}>
                        <ThemedText
                            variant="primary"
                            weight="semibold"
                            size="md"
                            style={styles.sectionTitle}
                        >
                            Attached Images
                        </ThemedText>
                        <MediaGallery mediaUrls={report.medias || []} isEditable={false} />
                    </View>

                    {/* Timeline */}
                    <View style={styles.section}>
                        <ThemedText
                            variant="primary"
                            weight="semibold"
                            size="md"
                            style={styles.sectionTitle}
                        >
                            Activity Timeline
                        </ThemedText>
                        <Timeline items={report.timelines || []} />
                    </View>

                    {/* Action Panel */}
                    <ReportActions
                        currentStatus={report.reportStatus}
                        isOfficer={isOfficer}
                        reportId={report.id}
                        userId={user?.id}
                        onActionComplete={handleActionComplete}
                    />
                </ScrollView>
            </ThemedView>
        </ThemedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    headerTitle: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingBottom: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    statusBadge: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: "flex-start",
        marginBottom: 20,
    },
    statusText: {
        color: "#fff",
        textTransform: "capitalize",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    descriptionText: {
        lineHeight: 20,
    },
});
