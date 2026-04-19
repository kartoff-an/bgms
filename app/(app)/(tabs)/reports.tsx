import React, { useState, useCallback, useRef } from "react";
import {
    View,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { useThemeColor } from "@app/hooks/use-theme-color";
import {
    ThemedScreenWrapper,
    ThemedView,
    ThemedText,
    ThemedCard,
    ThemedButton,
} from "@app/components/ui";

import { MonitoringReport, ReportStatus } from "@app/types/report";
import { Pageable, Page } from "@app/types/common";
import { monitoringReportService } from "@app/services/report.service";

import { useAuth } from "@app/contexts/auth.context";
import { UserRole } from "@app/types/user";
import { Radius, Elevation } from "@app/constants/theme";
import ReportCard from "@app/components/reports/report-card";

type TabType = "my" | "officer";

export default function ReportsScreen() {
    const theme = useThemeColor();
    const router = useRouter();
    const { user } = useAuth();
    const isOfficer = user?.role === UserRole.OFFICER;
    const scrollY = useRef(new Animated.Value(0)).current;

    const [reports, setReports] = useState<MonitoringReport[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<TabType>("my");
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isFetchError, setIsFetchError] = useState<boolean>(false);

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.95],
        extrapolate: "clamp",
    });

    const fetchReports = useCallback(
        async (pageable: Pageable = { page: 0, size: 10 }, replace = false) => {
            if (loading) return;
            setLoading(true);
            setIsFetchError(false);

            try {
                let data: Page<MonitoringReport>;

                if (activeTab === "my") {
                    data = await monitoringReportService.myReports(pageable);
                } else {
                    data = await monitoringReportService.activeReports(pageable);
                }

                setReports((prev) => (replace ? data.content : [...prev, ...data.content]));
                setPage(data.number);
                setTotalPages(data.totalPages);
                setIsFetchError(false);
            } catch (error) {
                console.error("Failed to fetch reports", error);
                setIsFetchError(true);
                if (replace) {
                    setReports([]);
                }
            } finally {
                setLoading(false);
            }
        },
        [activeTab, loading],
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setIsFetchError(false);
        await fetchReports({ page: 0, size: 10 }, true);
        setRefreshing(false);
    }, [fetchReports]);

    const handleRetry = () => {
        fetchReports({ page: 0, size: 10 }, true);
    };

    const loadMore = () => {
        if (page + 1 >= totalPages || loading || isFetchError) return;
        fetchReports({ page: page + 1, size: 10 });
    };

    useFocusEffect(
        useCallback(() => {
            setReports([]);
            setPage(0);
            setTotalPages(1);
            setIsFetchError(false);

            fetchReports({ page: 0, size: 10 }, true);
        }, [activeTab])
    );

    const handleReportPress = (report: MonitoringReport) => {
        if (activeTab === "officer") {
            router.push({
                pathname: "../reports/active-report",
                params: { id: report.id },
            });
        } else {
            router.push({
                pathname: "../reports/my-report",
                params: { id: report.id },
            });
        }
    };

    const pendingCount = reports.filter((r) => r.reportStatus === ReportStatus.PENDING).length;

    const renderErrorState = () => (
        <ThemedCard variant="outlined" style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
                <Ionicons name="cloud-offline-outline" size={64} color={theme.danger} />
            </View>
            <ThemedText variant="danger" weight="semibold" size="lg" style={styles.errorTitle}>
                Unable to Load Reports
            </ThemedText>
            <ThemedText variant="secondary" size="sm" style={styles.errorText}>
                {activeTab === "officer"
                    ? "We couldn't load the validation reports. Please check your connection and try again."
                    : "We couldn't load your reports. Please check your connection and try again."}
            </ThemedText>
            <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.primary }]}
                onPress={handleRetry}
                activeOpacity={0.8}
            >
                <Ionicons name="refresh-outline" size={20} color="#FFF" />
                <ThemedText style={styles.retryButtonText} variant="primary">
                    Try Again
                </ThemedText>
            </TouchableOpacity>
        </ThemedCard>
    );

    const renderEmptyState = () => (
        <ThemedCard variant="outlined" style={styles.emptyContainer}>
            <Ionicons
                name="document-text-outline"
                size={64}
                color={theme.textSecondary}
            />
            <ThemedText variant="primary" weight="semibold" size="lg" style={styles.emptyTitle}>
                {activeTab === "officer"
                    ? "No pending reports"
                    : "No reports yet"}
            </ThemedText>
            <ThemedText variant="secondary" size="sm" style={styles.emptyText}>
                {activeTab === "officer"
                    ? "All caught up! Check back later for new reports."
                    : "Start by creating your first environmental report"}
            </ThemedText>
            {activeTab !== "officer" && (
                <ThemedButton
                    title="Create New Report"
                    variant="primary"
                    size="sm"
                    onPress={() => router.push("../reports/new-report")}
                    style={styles.emptyButton}
                />
            )}
        </ThemedCard>
    );

    return (
        <ThemedScreenWrapper>
            <ThemedView variant="default" style={{ flex: 1 }}>
                <Animated.ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.primary}
                            colors={[theme.primary]}
                        />
                    }
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={({ nativeEvent }) => {
                        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
                            loadMore();
                        }
                    }}
                >
                    {/* Animated Header */}
                    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                        <View style={styles.headerTop}>
                            <View style={styles.titleContainer}>
                                <ThemedText variant="primary" size="xl" weight="bold" style={styles.title}>
                                    My Reports
                                </ThemedText>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Stats Summary (only for my reports and when no error) */}
                    {activeTab === "my" && reports.length > 0 && !isFetchError && (
                        <View style={styles.statsSummary}>
                            <View style={styles.statBox}>
                                <ThemedText variant="primary" weight="bold" size="lg">
                                    {reports.length}
                                </ThemedText>
                                <ThemedText variant="secondary" size="xs">
                                    Total
                                </ThemedText>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                            <View style={styles.statBox}>
                                <ThemedText variant="warning" weight="bold" size="lg">
                                    {reports.filter(r => r.reportStatus === ReportStatus.PENDING).length}
                                </ThemedText>
                                <ThemedText variant="secondary" size="xs">
                                    Pending
                                </ThemedText>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                            <View style={styles.statBox}>
                                <ThemedText variant="success" weight="bold" size="lg">
                                    {reports.filter(r => r.reportStatus === ReportStatus.REVIEWED).length}
                                </ThemedText>
                                <ThemedText variant="secondary" size="xs">
                                    Approved
                                </ThemedText>
                            </View>
                        </View>
                    )}

                    {/* Tab Switcher (officer only) */}
                    {isOfficer && !isFetchError && (
                        <View style={styles.tabSwitcher}>
                            <TabButton
                                title="My Reports"
                                active={activeTab === "my"}
                                onPress={() => setActiveTab("my")}
                            />
                            <TabButton
                                title="Validate"
                                active={activeTab === "officer"}
                                onPress={() => setActiveTab("officer")}
                                badge={pendingCount}
                            />
                        </View>
                    )}

                    {/* Error State */}
                    {!loading && isFetchError && renderErrorState()}

                    {/* Reports List */}
                    {!isFetchError && reports.map((report, index) => (
                        <TouchableOpacity
                            key={report.id}
                            activeOpacity={0.85}
                            onPress={() => handleReportPress(report)}
                        >
                            <ReportCard
                                report={report}
                                showValidationHint={activeTab === "officer"}
                            />
                        </TouchableOpacity>
                    ))}

                    {/* Loading Indicator */}
                    {loading && !isFetchError && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={theme.primary} />
                        </View>
                    )}

                    {/* Empty State */}
                    {!loading && !isFetchError && reports.length === 0 && renderEmptyState()}

                    <View style={styles.bottomPadding} />
                </Animated.ScrollView>

                {/* FAB for creating new reports */}
                {activeTab !== "officer" && !isFetchError && (
                    <TouchableOpacity
                        style={[
                            styles.floatingButton,
                            {
                                backgroundColor: theme.primary,
                                ...Elevation.md,
                            },
                        ]}
                        onPress={() => router.push("../reports/new-report")}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="add" size={28} color="white" />
                    </TouchableOpacity>
                )}
            </ThemedView>
        </ThemedScreenWrapper>
    );
}

function TabButton({
    title,
    active,
    onPress,
    badge,
}: {
    title: string;
    active: boolean;
    onPress: () => void;
    badge?: number;
}) {
    const theme = useThemeColor();
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[
                styles.tabButton,
                {
                    backgroundColor: active ? theme.primary + "15" : theme.surface,
                    borderColor: active ? theme.primary : theme.border,
                    borderWidth: active ? 1.5 : 1,
                },
            ]}
        >
            <View style={styles.tabButtonContent}>
                <ThemedText
                    variant={active ? "primary" : "secondary"}
                    weight={active ? "bold" : "medium"}
                    style={active && { color: theme.primary }}
                >
                    {title}
                </ThemedText>
                {badge !== undefined && badge > 0 && (
                    <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                        <ThemedText variant="primary" size="xs" weight="bold" style={styles.badgeText}>
                            {badge}
                        </ThemedText>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 100,
    },

    header: {
        marginBottom: 20,
    },

    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },

    title: {
        flex: 1,
    },

    communityButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: "transparent",
    },

    subtitle: {
        opacity: 0.7,
        marginLeft: 38,
    },

    statsSummary: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        padding: 16,
        borderRadius: Radius.lg,
        marginBottom: 20,
    },

    statBox: {
        alignItems: "center",
        gap: 4,
        flex: 1,
    },

    statDivider: {
        width: 1,
        height: 30,
    },

    tabSwitcher: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },

    tabButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Radius.md,
        justifyContent: "center",
        alignItems: "center",
    },

    tabButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    badge: {
        borderRadius: Radius.sm,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 22,
        alignItems: "center",
    },

    badgeText: {
        color: "white",
        fontSize: 11,
    },

    floatingButton: {
        position: "absolute",
        bottom: 80,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },

    loadingContainer: {
        padding: 20,
        alignItems: "center",
    },

    emptyContainer: {
        padding: 48,
        alignItems: "center",
        gap: 16,
    },

    emptyTitle: {
        marginTop: 8,
        textAlign: "center",
    },

    emptyText: {
        textAlign: "center",
        lineHeight: 20,
    },

    emptyButton: {
        marginTop: 8,
        paddingHorizontal: 24,
    },

    errorContainer: {
        padding: 48,
        alignItems: "center",
        gap: 16,
        marginTop: 20,
    },

    errorIconContainer: {
        marginBottom: 8,
    },

    errorTitle: {
        marginTop: 8,
        textAlign: "center",
    },

    errorText: {
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 8,
    },

    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: Radius.lg,
        marginTop: 8,
    },

    retryButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
    },

    bottomPadding: {
        height: 40,
    },
});