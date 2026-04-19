import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useThemeColor } from "@app/hooks/use-theme-color";
import {
    ThemedScreenWrapper,
    ThemedView,
    ThemedText,
    ThemedCard,
    ThemedInput,
} from "@app/components/ui";

import { MonitoringReport } from "@app/types/report";
import { Pageable } from "@app/types/common";
import { monitoringReportService } from "@app/services/report.service";

import { Radius } from "@app/constants/theme";
import { useAuth } from "@app/contexts/auth.context";
import { useLocation } from "@app/hooks/use-location";
import FeedItem from "@app/components/reports/feed-item";
import FilterChip from "@app/components/filter-chip";

type FeedFilter = "recent" | "in-municipality" | "nearby" | "in-geosite";

export default function CommunityFeedScreen() {
    const theme = useThemeColor();
    const router = useRouter();
    const scrollY = useRef(new Animated.Value(0)).current;
    const { user } = useAuth();
    const { getCurrentLocation } = useLocation();

    const [reports, setReports] = useState<MonitoringReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<MonitoringReport[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FeedFilter>("recent");
    const [searchQuery, setSearchQuery] = useState("");
    const [geositeFilter, setGeositeFilter] = useState<{ id: string; name: string } | null>(null);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const params = useLocalSearchParams();
    const geositeId = params.geositeId as string;
    const geositeName = params.geositeName as string;
    const filterByGeosite = params.filterByGeosite === "true";

    useEffect(() => {
        if (filterByGeosite && geositeId && geositeName) {
            setGeositeFilter({ id: geositeId, name: geositeName });
            setActiveFilter("in-geosite");
            router.setParams({});
        }
    }, [filterByGeosite, geositeId, geositeName]);

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.9],
        extrapolate: "clamp",
    });

    const fetchReportsWithFilter = useCallback(
        async (filter: FeedFilter, pageable: Pageable = { page: 0, size: 10 }, replace = false, currentGeositeFilter = geositeFilter) => {
            try {
                setLoading(true);

                let data;
                switch (filter) {
                    case "nearby": {
                        const location = await getCurrentLocation();
                        if (!location?.latitude || !location?.longitude) {
                            console.warn("Location not available");
                            setLoading(false);
                            return;
                        }
                        data = await monitoringReportService.getNearbyReports(
                            location.latitude,
                            location.longitude,
                            10,
                            pageable
                        );
                        break;
                    }
                    case "in-municipality": {
                        if (!user?.municipalityId) {
                            console.warn("Municipality ID missing");
                            setLoading(false);
                            return;
                        }
                        data = await monitoringReportService.getReportsByMunicipality(
                            user.municipalityId,
                            pageable
                        );
                        break;
                    }
                    case "in-geosite": {
                        if (!currentGeositeFilter?.id) {
                            setLoading(false);
                            return;
                        }
                        data = await monitoringReportService.getReportsByGeosite(
                            currentGeositeFilter.id,
                            pageable
                        );
                        break;
                    }
                    default:
                        data = await monitoringReportService.communityReports(pageable);
                }

                if (!data) {
                    setLoading(false);
                    return;
                }

                setReports(prev =>
                    replace ? data.content : [...prev, ...data.content]
                );
                setPage(data.number);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error("Failed to fetch community feed", error);
            } finally {
                setLoading(false);
            }
        },
        [user?.municipalityId, getCurrentLocation]
    );

    const fetchReports = useCallback(
        async (pageable: Pageable = { page: 0, size: 10 }, replace = false) => {
            await fetchReportsWithFilter(activeFilter, pageable, replace, geositeFilter);
        },
        [activeFilter, geositeFilter, fetchReportsWithFilter]
    );

    useEffect(() => {
        if (!initialLoadDone) {
            fetchReports({ page: 0, size: 10 }, true);
            setInitialLoadDone(true);
        }
    }, [initialLoadDone, fetchReports]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredReports(reports);
            return;
        }

        const q = searchQuery.toLowerCase();

        const filtered = reports.filter(
            r =>
                r.damageType?.toLowerCase().includes(q) ||
                r.damageDescription?.toLowerCase().includes(q) ||
                r.geositeName?.toLowerCase().includes(q)
        );

        setFilteredReports(filtered);
    }, [searchQuery, reports]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchReports({ page: 0, size: 10 }, true);
        setRefreshing(false);
    }, [fetchReports]);

    const loadMore = () => {
        if (loading) return;
        if (page + 1 >= totalPages) return;

        fetchReports({ page: page + 1, size: 10 }, false);
    };

    const handleFilterChange = async (filter: FeedFilter) => {
        // Prevent unnecessary API calls if filter hasn't changed
        if (filter === activeFilter && !geositeFilter) return;

        setActiveFilter(filter);
        setReports([]);
        setFilteredReports([]);
        setPage(0);

        if (filter !== "in-geosite") {
            setGeositeFilter(null);
            // Fetch immediately with the new filter
            await fetchReportsWithFilter(filter, { page: 0, size: 10 }, true, null);
        } else {
            // For geosite filter, we need to wait for geositeFilter to be set
            // This will be handled by the geosite filter setter
        }
    };

    useEffect(() => {
        if (geositeFilter && activeFilter === "in-geosite") {
            fetchReportsWithFilter("in-geosite", { page: 0, size: 10 }, true, geositeFilter);
        }
    }, [geositeFilter, activeFilter, fetchReportsWithFilter]);

    const clearGeositeFilter = async () => {
        setGeositeFilter(null);
        setActiveFilter("recent");
        setReports([]);
        setFilteredReports([]);
        setPage(0);

        await fetchReportsWithFilter("recent", { page: 0, size: 10 }, true, null);
    };

    const handleReportPress = (report: MonitoringReport) => {
        router.push({
            pathname: "../reports/public-report",
            params: { id: report.id },
        });
    };

    const getFilterLabel = () => {
        if (geositeFilter) return `In ${geositeFilter.name}`;
        if (activeFilter === "in-municipality")
            return `In ${user?.municipalityName || "My Municipality"}`;
        if (activeFilter === "nearby") return "Near Me (10km)";
        return "All Reports";
    };

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
                        <ThemedText variant="primary" size="xl" weight="bold" style={styles.title}>
                            Community Feed
                        </ThemedText>
                    </Animated.View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <ThemedInput
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            leftIcon={<Ionicons name="search-outline" size={20} color={theme.textSecondary} />}
                            style={styles.searchInput}
                        />
                    </View>

                    {/* Filter Chips */}
                    <View style={styles.filterContainer}>
                        <FilterChip
                            label="All"
                            active={activeFilter === "recent" && !geositeFilter}
                            onPress={() => handleFilterChange("recent")}
                            icon="time-outline"
                        />
                        {user?.municipalityName && (
                            <FilterChip
                                label={user.municipalityName.split(" ")[0]}
                                active={activeFilter === "in-municipality" && !geositeFilter}
                                onPress={() => handleFilterChange("in-municipality")}
                                icon="business-outline"
                            />
                        )}
                        <FilterChip
                            label="Near Me"
                            active={activeFilter === "nearby" && !geositeFilter}
                            onPress={() => handleFilterChange("nearby")}
                            icon="location-outline"
                        />
                    </View>

                    {/* Active Geosite Filter Chip */}
                    {geositeFilter && (
                        <View style={styles.geositeFilterContainer}>
                            <FilterChip
                                label={geositeFilter.name}
                                active={true}
                                onPress={clearGeositeFilter}
                                icon="location-outline"
                            />
                        </View>
                    )}

                    {/* Stats Bar */}
                    <View style={[styles.statsBar, { backgroundColor: theme.surface }]}>
                        <View style={styles.statItem}>
                            <Ionicons name="document-text-outline" size={18} color={theme.primary} />
                            <ThemedText variant="secondary" size="xs" style={styles.statText}>
                                {filteredReports.length} reports
                            </ThemedText>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.statItem}>
                            <Ionicons name="filter-outline" size={18} color={theme.primary} />
                            <ThemedText variant="secondary" size="xs" style={styles.statText}>
                                {getFilterLabel()}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Feed Items */}
                    {filteredReports.map((report, index) => (
                        <FeedItem
                            key={report.id}
                            report={report}
                            onPress={() => handleReportPress(report)}
                            isLast={index === filteredReports.length - 1}
                        />
                    ))}

                    {/* Loading Indicator */}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={theme.primary} />
                        </View>
                    )}

                    {/* Empty State */}
                    {!loading && filteredReports.length === 0 && (
                        <ThemedCard style={styles.emptyContainer}>
                            <Ionicons
                                name="newspaper-outline"
                                size={64}
                                color={theme.textSecondary}
                            />
                            <ThemedText variant="primary" weight="semibold" size="lg" style={styles.emptyTitle}>
                                No reports yet
                            </ThemedText>
                            <ThemedText variant="secondary" size="sm" style={styles.emptyText}>
                                {searchQuery
                                    ? "Try adjusting your search"
                                    : geositeFilter
                                        ? `No reports found in ${geositeFilter.name}`
                                        : activeFilter === "in-municipality"
                                            ? `No reports found in ${user?.municipalityName}`
                                            : activeFilter === "nearby"
                                                ? "No reports found within 10km of your location"
                                                : "Be the first to report environmental issues"}
                            </ThemedText>
                        </ThemedCard>
                    )}

                    <View style={styles.bottomPadding} />
                </Animated.ScrollView>
            </ThemedView>
        </ThemedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },

    header: {
        marginBottom: 20,
    },

    title: {
        marginBottom: 4,
        flex: 1
    },

    searchContainer: {
        marginBottom: 16,
    },

    searchInput: {
        borderRadius: Radius.lg,
    },

    filterContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
    },

    geositeFilterContainer: {
        marginBottom: 16,
    },

    statsBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: Radius.md,
        marginBottom: 20,
    },

    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    statText: {
        fontSize: 12,
    },

    statDivider: {
        width: 1,
        height: 20,
    },

    loadingContainer: {
        padding: 20,
        alignItems: "center",
    },

    emptyContainer: {
        padding: 48,
        alignItems: "center",
        gap: 12,
    },

    emptyTitle: {
        marginTop: 8,
    },

    emptyText: {
        textAlign: "center",
        lineHeight: 20,
    },

    bottomPadding: {
        height: 40,
    },
});