import React, { ReactNode, forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import * as MapLibreGL from "@maplibre/maplibre-react-native";
import osmStyle from "@app/assets/styles/osm-style.json";
import { BOHOL_CENTER } from "@app/constants/map";

interface OSMMapProps {
    children?: ReactNode;
    style?: ViewStyle;
    centerCoordinate?: [number, number];
    zoomLevel?: number;
    minZoomLevel?: number;
    maxZoomLevel?: number;
    maxBounds?: { ne: number[]; sw: number[] };
    onPress?: (event: any) => void;
    onLongPress?: (event: any) => void;
    onMapReady?: () => void;
}

export interface OSMMapRef {
    getCamera: () => MapLibreGL.CameraRef | null;
    setCamera: (options: {
        centerCoordinate?: [number, number];
        zoomLevel?: number;
        animationDuration?: number;
        animationMode?: "flyTo" | "easeTo" | "moveTo";
    }) => void;
    fitBounds: (bounds: { ne: number[]; sw: number[] }, padding?: number) => void;
}

export const OSMMap = forwardRef<OSMMapRef, OSMMapProps>(
    (
        {
            children,
            style,
            centerCoordinate = BOHOL_CENTER,
            zoomLevel = 10,
            minZoomLevel = 8,
            maxZoomLevel = 18,
            maxBounds,
            onPress,
            onLongPress,
            onMapReady,
        },
        ref,
    ) => {
        const cameraRef = useRef<MapLibreGL.CameraRef>(null);
        const mapRef = useRef<MapLibreGL.MapViewRef>(null);

        useImperativeHandle(ref, () => ({
            getCamera: () => cameraRef.current,
            setCamera: (options) => {
                if (cameraRef.current) {
                    cameraRef.current.setCamera(options);
                }
            },
            fitBounds: (bounds, padding = 50) => {
                if (cameraRef.current) {
                    cameraRef.current.fitBounds(bounds.ne, bounds.sw, padding);
                }
            },
        }));

        const handleMapReady = () => {
            onMapReady?.();
        };

        return (
            <MapLibreGL.MapView
                ref={mapRef}
                style={[styles.map, style]}
                logoEnabled={false}
                attributionEnabled={false}
                onPress={onPress}
                onLongPress={onLongPress}
                mapStyle={osmStyle}
                onDidFinishLoadingMap={handleMapReady}
            >
                <MapLibreGL.Camera
                    ref={cameraRef}
                    defaultSettings={{
                        centerCoordinate,
                        zoomLevel,
                    }}
                    minZoomLevel={minZoomLevel}
                    maxZoomLevel={maxZoomLevel}
                    maxBounds={maxBounds}
                />

                {children}
            </MapLibreGL.MapView>
        );
    },
);

OSMMap.displayName = "OSMMap";

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
});