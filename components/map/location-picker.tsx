import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Animated, TouchableOpacity, Alert } from "react-native";
import * as MapLibreGL from "@maplibre/maplibre-react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { useLocation } from "@app/hooks/use-location";
import { OSMMap } from "@app/components/map/osm-map";
import { Radius, Elevation } from "@app/constants/theme";
import { BOHOL_CENTER } from "@app/constants/map";

interface LocationPickerProps {
    latitude: number | null;
    longitude: number | null;
    onLocationSelect: (latitude: number, longitude: number) => void;
    error?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
    latitude,
    longitude,
    onLocationSelect,
}) => {
    const theme = useThemeColor();
    const cameraRef = useRef<MapLibreGL.CameraRef>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [gettingLocation, setGettingLocation] = useState(false);
    const { getCurrentLocation: getLocation } = useLocation();

    useEffect(() => {
        if (latitude && longitude && cameraRef.current) {
            cameraRef.current.setCamera({
                centerCoordinate: [longitude, latitude],
                zoomLevel: 16,
                animationDuration: 500,
            });

            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.5,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        }
    }, [latitude, longitude, pulseAnim]);

    const handleGetCurrentLocation = async () => {
        setGettingLocation(true);
        const location = await getLocation();
        if (location) {
            onLocationSelect(location.latitude, location.longitude);
        } else {
            Alert.alert("Error", "Failed to get your current location.");
        }
        setGettingLocation(false);
    };

    const handleMapPress = async (event: any) => {
        const { geometry } = event;
        if (geometry?.coordinates) {
            const [lng, lat] = geometry.coordinates;
            onLocationSelect(lat, lng);
        }
    };

    return (
        <View style={styles.container}>
            <ThemedText variant="primary" weight="semibold" size="md" style={styles.title}>
                Pick Location on Map
            </ThemedText>

            <View
                style={[
                    styles.mapContainer,
                    {
                        borderColor: theme.border,
                        borderWidth: 1,
                    },
                ]}
            >
                <OSMMap
                    centerCoordinate={latitude && longitude ? [longitude, latitude] : BOHOL_CENTER}
                    zoomLevel={latitude && longitude ? 16 : 10}
                    minZoomLevel={8}
                    maxZoomLevel={18}
                    onPress={handleMapPress}
                >
                    {latitude && longitude && (
                        <MapLibreGL.MarkerView
                            id="selectedLocation"
                            coordinate={[longitude, latitude]}
                        >
                            <View style={styles.markerContainer}>
                                <Animated.View
                                    style={[
                                        styles.pulsingRing,
                                        {
                                            transform: [{ scale: pulseAnim }],
                                            opacity: pulseAnim.interpolate({
                                                inputRange: [1, 1.5],
                                                outputRange: [0.6, 0],
                                            }),
                                        },
                                    ]}
                                />
                                <View
                                    style={[styles.solidCircle, { backgroundColor: "#EA4335" }]}
                                />
                            </View>
                        </MapLibreGL.MarkerView>
                    )}
                </OSMMap>

                <TouchableOpacity
                    style={[
                        styles.locationButton,
                        {
                            backgroundColor: theme.surface,
                            ...Elevation.md,
                        },
                    ]}
                    onPress={handleGetCurrentLocation}
                    disabled={gettingLocation}
                >
                    <Ionicons
                        name="locate"
                        size={22}
                        color={gettingLocation ? theme.textSecondary : theme.primary}
                    />
                </TouchableOpacity>
            </View>

            {latitude && longitude && (
                <ThemedText variant="secondary" size="xs" style={styles.coordinates}>
                    Selected: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </ThemedText>
            )}

            <ThemedText variant="secondary" size="xs" style={styles.hint}>
                Tap on the map to select a location
            </ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    title: {
        marginBottom: 4,
    },
    mapContainer: {
        width: "100%",
        height: 280,
        borderRadius: Radius.md,
        overflow: "hidden",
        position: "relative",
    },
    markerContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    pulsingRing: {
        position: "absolute",
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#EA4335",
    },
    solidCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    locationButton: {
        position: "absolute",
        bottom: 12,
        right: 12,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    coordinates: {
        textAlign: "center",
        marginTop: 8,
    },
    hint: {
        textAlign: "center",
        fontStyle: "italic",
    },
});