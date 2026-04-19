import { useRef, useEffect, useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import * as MapLibreGL from "@maplibre/maplibre-react-native";
import { GeositeDetailModal } from "@app/components/geosite-detail-modal";
import { Geosite, GeositeStatus } from "@app/types/geosite";
import { OSMMap, OSMMapRef } from "@app/components/map/osm-map";
import { MapMarker } from "@app/components/map/map-marker";
import { MapControl } from "@app/components/map/map-controls";
import { useLocation } from "@app/hooks/use-location";
import { useGeosites } from "@app/hooks/use-geosites";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedScreenWrapper, ThemedView } from "@app/components/ui";
import { useLocalSearchParams, router } from "expo-router";
import { getGeositeStatusColor } from "@app/utils/color";
import { BOHOL_BOUNDS, BOHOL_CENTER } from "@app/constants/map";

const MapsScreen = () => {
    const theme = useThemeColor();
    const params = useLocalSearchParams();
    const mapRef = useRef<OSMMapRef>(null);
    const { startWatching } = useLocation();
    const { geosites, fetchGeosites } = useGeosites();

    const [selectedGeosite, setSelectedGeosite] = useState<Geosite | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    const lastHandledRef = useRef<string | null>(null);

    const targetGeositeId = params.geositeId as string;
    const targetLatitude = params.latitude ? parseFloat(params.latitude as string) : null;
    const targetLongitude = params.longitude ? parseFloat(params.longitude as string) : null;

    useEffect(() => {
        startWatching((lat, lng) => {
            setUserCoords([lng, lat]);
        });
    }, []);

    useEffect(() => {
        if (!isMapReady || !mapRef.current) {
            // If we have coordinates from params, center on that geosite
            if (targetLatitude && targetLongitude) {
                const key = `${targetLatitude}-${targetLongitude}-${targetGeositeId}`;

                if (lastHandledRef.current === key) return;
                lastHandledRef.current = key;

                setTimeout(() => {
                    mapRef.current?.setCamera({
                        centerCoordinate: [targetLongitude, targetLatitude],
                        zoomLevel: 14,
                        animationDuration: 1000,
                        animationMode: "flyTo",
                    });

                    const geosite = geosites.find(
                        (site) => site.id === targetGeositeId
                    );
                    if (geosite) {
                        setTimeout(() => {
                            setSelectedGeosite(geosite);
                            setModalVisible(true);
                        }, 1000);
                    }
                }, 500);
            }
            router.setParams({});
        }
    }, [
        isMapReady,
        targetLatitude,
        targetLongitude,
        targetGeositeId,
        geosites
    ]);

    const goToCurrentLocation = useCallback(() => {
        if (userCoords && mapRef.current) {
            mapRef.current.setCamera({
                centerCoordinate: userCoords,
                zoomLevel: 15,
                animationDuration: 500,
            });
        }
    }, [userCoords]);

    const refreshMap = useCallback(() => {
        if (mapRef.current) {
            mapRef.current.setCamera({
                centerCoordinate: BOHOL_CENTER,
                zoomLevel: 8,
                animationDuration: 500,
            });
        }
        fetchGeosites();
    }, []);

    const handleMapReady = useCallback(() => {
        setIsMapReady(true);
    }, []);

    const handleMarkerPress = (geosite: Geosite) => {
        setSelectedGeosite(geosite);
        setModalVisible(true);
    };

    return (
        <ThemedScreenWrapper>
            <ThemedView variant="default" style={styles.container}>
                <OSMMap
                    ref={mapRef}
                    centerCoordinate={BOHOL_CENTER}
                    zoomLevel={10}
                    minZoomLevel={8}
                    maxZoomLevel={18}
                    maxBounds={BOHOL_BOUNDS}
                    onMapReady={handleMapReady}
                >
                    <MapLibreGL.UserLocation
                        visible={true}
                        onUpdate={(location) => {
                            if (location.coords) {
                                setUserCoords([
                                    location.coords.longitude,
                                    location.coords.latitude,
                                ]);
                            }
                        }}
                    />

                    {geosites.map((site) => (
                        <MapMarker
                            key={site.id}
                            coordinate={[site.longitude!, site.latitude!]}
                            onPress={() => handleMarkerPress(site)}
                            color={getGeositeStatusColor(site.overallStatus)}
                            size={20}
                            isCritical={site.overallStatus === GeositeStatus.CRITICAL}
                        />
                    ))}
                </OSMMap>

                <MapControl
                    icon="refresh"
                    onPress={refreshMap}
                    position="bottom-right"
                    color={theme.success}
                    offset={120}
                />

                <MapControl
                    icon="my-location"
                    onPress={goToCurrentLocation}
                    position="bottom-right"
                    color={theme.info}
                    offset={60}
                />

                <GeositeDetailModal
                    visible={modalVisible}
                    geosite={selectedGeosite}
                    onClose={() => setModalVisible(false)}
                />
            </ThemedView>
        </ThemedScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default MapsScreen;