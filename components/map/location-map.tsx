import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import * as MapLibreGL from "@maplibre/maplibre-react-native";
import { ThemedText } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { Radius } from "@app/constants/theme";

interface LocationMapProps {
    latitude: number;
    longitude: number;
}

export const LocationMap: React.FC<LocationMapProps> = ({ latitude, longitude }) => {
    const theme = useThemeColor();
    const cameraRef = useRef<MapLibreGL.CameraRef>(null);

    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <MapLibreGL.MapView style={{ flex: 1 }} logoEnabled={false} attributionEnabled>
                    <MapLibreGL.Camera
                        ref={cameraRef}
                        defaultSettings={{ centerCoordinate: [longitude, latitude], zoomLevel: 16 }}
                        minZoomLevel={12}
                        maxZoomLevel={18}
                    />
                    <MapLibreGL.RasterSource
                        id="osmSource"
                        tileUrlTemplates={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]}
                        tileSize={256}
                    >
                        <MapLibreGL.RasterLayer id="osmLayer" />
                    </MapLibreGL.RasterSource>
                    <MapLibreGL.PointAnnotation
                        id="reportLocation"
                        coordinate={[longitude, latitude]}
                    >
                        <View style={[styles.marker, { backgroundColor: theme.primary }]} />
                    </MapLibreGL.PointAnnotation>
                </MapLibreGL.MapView>
            </View>
            <ThemedText variant="secondary" size="xs" style={styles.coordinates}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    mapContainer: {
        width: "100%",
        height: 200,
        borderRadius: Radius.md,
        overflow: "hidden",
        marginBottom: 8,
    },
    marker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#fff",
    },
    coordinates: {
        textAlign: "center",
        marginTop: 8,
    },
});
