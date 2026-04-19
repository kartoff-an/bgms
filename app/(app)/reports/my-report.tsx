import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedScreenWrapper, ThemedView, ThemedText, ThemedButton } from "@app/components/ui";
import { Timeline } from "@app/components/reports/timeline";
import { MediaGallery } from "@app/components/media/media-gallery";
import { ReportDetailsCard } from "@app/components/reports/report-details-card";
import { LocationMap } from "@app/components/map/location-map";
import { useMediaUpload } from "@app/hooks/use-media-upload";

import { MonitoringReport, ReportStatus } from "@app/types/report";
import { monitoringReportService } from "@app/services/report.service";
import { geositeService } from "@app/services/geosite.service";
import { Geosite } from "@app/types/geosite";

export default function MyReportDetailScreen() {
    const theme = useThemeColor();
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [report, setReport] = useState<MonitoringReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [geosite, setGeosite] = useState<Geosite | null>(null);
    const [loadingGeosite, setLoadingGeosite] = useState(false);

    const isPending = report?.reportStatus === ReportStatus.PENDING;
    const { uploading, uploadAndAddMedia } = useMediaUpload({
        context: "reports",
        onSuccess: async (fileUrl) => {
            const updatedReport = await monitoringReportService.addMedia(id, fileUrl);
            setReport(updatedReport);
        },
    });

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

    const handleWithdraw = async () => {
        await monitoringReportService.withdraw(id);
        router.back();
    };

    const handleAddMedia = async (asset: ImagePicker.ImagePickerAsset) => {
        await uploadAndAddMedia(asset);
    };

    const handleRemoveMedia = async (mediaUrl: string) => {
        const updatedReport = await monitoringReportService.removeMedia(id, mediaUrl);
        setReport(updatedReport);
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
            case ReportStatus.PENDING:
                return theme.warning;
            case ReportStatus.UNDER_REVIEW:
                return theme.info;
            case ReportStatus.REVIEWED:
                return theme.success;
            case ReportStatus.REJECTED:
                return theme.danger;
            default:
                return theme.textSecondary;
        }
    };

    return (
        <ThemedScreenWrapper>
            <ThemedView variant="default" style={{ flex: 1 }}>
                {/* <GeoparkBackground /> */}

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
                        {report.damageType || "Unknown"}
                    </ThemedText>
                </View>

                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                        <ThemedText
                            variant="primary"
                            size="xs"
                            weight="bold"
                            style={styles.statusText}
                        >
                            {report.reportStatus.replace("_", " ").toLowerCase()}
                        </ThemedText>
                    </View>

                    <ReportDetailsCard
                        damageType={report.damageType}
                        reportType={report.reportType}
                        createdAt={report.createdAt}
                        validationDate={report.validationDate}
                        validatorName={report.validatorName}
                        geosite={geosite}
                        loadingGeosite={loadingGeosite}
                    />

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

                    {typeof report.latitude === "number" &&
                        typeof report.longitude === "number" && (
                            <LocationMap latitude={report.latitude} longitude={report.longitude} />
                        )}

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <ThemedText variant="primary" weight="semibold" size="md">
                                Attached Images
                            </ThemedText>
                        </View>
                        <MediaGallery
                            mediaUrls={report.medias || []}
                            isEditable={isPending}
                            onAddMedia={handleAddMedia}
                            onRemoveMedia={handleRemoveMedia}
                            uploadingMedia={uploading}
                        />
                    </View>

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

                    <ThemedButton
                        title={
                            !isPending
                                ? report.reportStatus.replace("_", " ").toLowerCase()
                                : "Withdraw Report"
                        }
                        variant="danger"
                        size="md"
                        onPress={handleWithdraw}
                        disabled={!isPending}
                        style={styles.withdrawButton}
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
    backButton: { marginRight: 12, padding: 4 },
    headerTitle: { flex: 1 },
    container: { padding: 20, paddingBottom: 50 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

    statusBadge: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: "flex-start",
        marginBottom: 20,
    },
    statusText: { color: "#fff", textTransform: "capitalize" },

    section: { marginBottom: 24 },
    sectionTitle: { marginBottom: 12 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    descriptionText: { lineHeight: 20 },
    withdrawButton: { marginTop: 8 },
});
