import React, { useEffect, useRef, useState } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedText, ThemedCard, ThemedView } from "@app/components/ui";
import { ScreenWrapper } from "@app/components/screen-wrapper";
import { useGeosites } from "@app/hooks/use-geosites";
import { useCommunityReportsCount } from "@app/hooks/use-reports-count";
import { Radius } from "@app/constants/theme";
import { GeositeDetailModal } from "@app/components/geosite-detail-modal";
import { Geosite } from "@app/types/geosite";
import { Municipality } from "@app/types/municipality";
import { municipalityService } from "@app/services/municipality.service";
import { useAuth } from "@app/contexts/auth.context";

const windowWidth = Dimensions.get("window").width;

export default function HomeScreen() {
    const theme = useThemeColor();
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const { user } = useAuth();
    const { geosites, totalCount: geositesCount } = useGeosites();
    const { count: communityReportsCount } = useCommunityReportsCount();

    const [selectedGeosite, setSelectedGeosite] = useState<Geosite | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

    const countInMyMunicipality = municipalities.find((m) => m.name === user?.municipalityName)?.geositeCount;

    const CARD_WIDTH = windowWidth * 0.85;
    const SPACING = 16;

    useEffect(() => {
        (async () => {
            const data = await municipalityService.getAll();
            setMunicipalities(data);
        })();
    }, [])

    const handleGeositePress = (geosite: Geosite) => {
        setSelectedGeosite(geosite);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedGeosite(null);
    };

    return (
        <ScreenWrapper>
            <ThemedView variant="default" style={{ flex: 1 }}>
                {/* <GeoparkBackground /> */}

                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <ThemedText variant="primary" weight="bold" size="xl" style={styles.welcome}>
                                Bohol Geopark
                            </ThemedText>

                            <ThemedText variant="secondary" size="sm" style={styles.subtitle}>
                                Community-based geosite protection and reporting system
                            </ThemedText>
                        </View>

                        <View style={[styles.logoCircle, { backgroundColor: "#ffffff" }]}>
                            <Image
                                source={require("@app/assets/images/BGMS_icon.png")}
                                style={styles.logoImage}
                                resizeMode="cover"
                            />
                        </View>
                    </View>

                    {/* Geosite Slider */}
                    <ThemedText variant="primary" weight="semibold" size="lg" style={styles.sectionTitle}>
                        Featured Geosites
                    </ThemedText>

                    <FlatList
                            data={geosites}
                            ref={flatListRef}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: SPACING / 2, marginBottom: 20 }}
                            snapToInterval={CARD_WIDTH + SPACING}
                            decelerationRate="fast"
                            bounces={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => handleGeositePress(item)}
                                >
                                    <ThemedCard variant="elevated" radius="sm" style={styles.geositeCard}>
                                        <Image
                                            source={{ uri: item.coverPhotoUrl }}
                                            style={styles.geositeImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.geositeOverlay}>
                                            <ThemedText variant="primary" weight="semibold" size="sm" style={styles.geositeName}>
                                                {item.name}
                                            </ThemedText>
                                            {item.municipalityName && (
                                                <View style={styles.municipalityBadge}>
                                                    <Ionicons name="business-outline" size={12} color={theme.primary} />
                                                    <ThemedText variant="secondary" size="xs">
                                                        {item.municipalityName}
                                                    </ThemedText>
                                                </View>
                                            )}
                                        </View>
                                    </ThemedCard>
                                </TouchableOpacity>
                            )}
                        />
                    
                    {/* Quick Actions */}
                    <ThemedText variant="primary" weight="semibold" size="lg" style={styles.sectionTitle}>
                        Quick Actions
                    </ThemedText>

                    <View style={styles.quickRow}>
                        <QuickAction
                            icon="map-outline"
                            title="Open Maps"
                            onPress={() => router.push("./maps")}
                        />
                        <QuickAction
                            icon="file-tray-full-outline"
                            title="Report Damage"
                            onPress={() => router.push("../reports/new-report")}
                        />
                    </View>

                    <View style={styles.quickRow}>
                        <QuickAction
                            icon="newspaper-outline"
                            title="View Recent Reports"
                            onPress={() => router.push("./community-feed")}
                        />
                        <QuickAction
                            icon="settings-outline"
                            title="Edit Preferences"
                            onPress={() => router.push("./settings")}
                        />
                    </View>

                    {/* Statistics */}
                    <ThemedText variant="primary" weight="semibold" size="lg" style={styles.sectionTitle}>
                        Monitoring Overview
                    </ThemedText>

                    <View style={styles.statsRow}>
                        <StatItem
                            icon="business-outline"
                            label="Municipalities"
                            value={municipalities.length}
                        />
                        <StatItem
                            icon="business-outline"
                            label="Geosites"
                            value={geositesCount}
                        />
                    </View>

                    <View style={styles.statsRow}>
                        <StatItem
                            icon="checkmark-circle-outline"
                            label={`Reports in ${user?.municipalityName}`}
                            value={countInMyMunicipality || 0}
                        />
                        <StatItem
                            icon="people-outline"
                            label="Community Reports"
                            value={communityReportsCount}
                        />
                    </View>

                    {/* Community Message */}
                    <ThemedCard variant="outlined" radius="md" style={styles.communityCard}>
                        <View style={styles.communityIconContainer}>
                            <Ionicons name="people-outline" size={32} color={theme.primary} />
                        </View>
                        <ThemedText variant="primary" weight="bold" size="md" style={styles.communityTitle}>
                            Community Participation
                        </ThemedText>
                        <ThemedText variant="secondary" size="sm" style={styles.communityText}>
                            Help protect Bohol&apos;s geosites by reporting environmental damages,
                            illegal activities, and natural hazards.
                        </ThemedText>
                    </ThemedCard>
                </ScrollView>

                {/* Geosite Detail Modal */}
                <GeositeDetailModal
                    visible={modalVisible}
                    geosite={selectedGeosite}
                    onClose={handleCloseModal}
                />
            </ThemedView>
        </ScreenWrapper>
    );
}

interface QuickActionProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
}

function QuickAction({ icon, title, onPress }: QuickActionProps) {
    const theme = useThemeColor();
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={styles.quickActionWrapper}
        >
            <ThemedCard variant="outlined" radius="md" style={styles.quickAction}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + "15" }]}>
                    <Ionicons name={icon} size={24} color={theme.primary} />
                </View>
                <ThemedText variant="primary" weight="medium" size="sm" style={styles.quickText}>
                    {title}
                </ThemedText>
            </ThemedCard>
        </TouchableOpacity>
    );
}

interface StatItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
}

function StatItem({ icon, label, value }: StatItemProps) {
    const theme = useThemeColor();
    return (
        <ThemedCard variant="outlined" radius="md" style={styles.statBox}>
            <View style={[styles.statIconContainer, { backgroundColor: theme.primary + "10" }]}>
                <Ionicons name={icon} size={20} color={theme.primary} />
            </View>
            <ThemedText variant="primary" weight="bold" size="xl" style={styles.statValue}>
                {value}
            </ThemedText>
            <ThemedText variant="secondary" size="xs" style={styles.statLabel}>
                {label}
            </ThemedText>
        </ThemedCard>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 100,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
        alignItems: "center",
    },

    welcome: {
        marginBottom: 4,
    },

    subtitle: {
        width: 240,
        lineHeight: 18,
    },

    logoCircle: {
        width: 70,
        height: 70,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },

    logoImage: {
        width: "70%",
        height: "70%",
    },

    sectionTitle: {
        marginBottom: 12,
        marginTop: 8,
    },

    geositeCard: {
        width: windowWidth * 0.65,
        marginRight: 16,
        overflow: "hidden",
        padding: 0,
    },

    geositeImage: {
        width: "100%",
        height: 140,
    },

    geositeOverlay: {
        padding: 12,
    },

    geositeName: {
        marginBottom: 4,
    },

    municipalityBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
    },

    quickRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
        gap: 14,
    },

    quickActionWrapper: {
        flex: 1,
    },

    quickAction: {
        padding: 16,
        alignItems: "center",
    },

    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    quickText: {
        textAlign: "center",
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
        gap: 14,
    },

    statBox: {
        flex: 1,
        padding: 16,
        alignItems: "center",
    },

    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: Radius.md,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    statValue: {
        marginBottom: 4,
    },

    statLabel: {
        textAlign: "center",
    },

    communityCard: {
        marginTop: 20,
        padding: 24,
        alignItems: "center",
    },

    communityIconContainer: {
        marginBottom: 12,
    },

    communityTitle: {
        marginBottom: 8,
        textAlign: "center",
    },

    communityText: {
        textAlign: "center",
        lineHeight: 20,
    },
});