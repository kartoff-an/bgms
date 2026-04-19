import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import * as MapLibreGL from "@maplibre/maplibre-react-native";

interface MapMarkerProps {
    coordinate: [number, number];
    onPress?: () => void;
    color?: string;
    size?: number;
    isCritical?: boolean;
}

export const MapMarker: React.FC<MapMarkerProps> = ({
    coordinate,
    onPress,
    color = "#FF5722",
    size = 20,
    isCritical = false,
}) => {
    const [pulse, setPulse] = useState(0);

    const requestRef = useRef<number | null>(null);
    const startTime = useRef<number>(Date.now());

    useEffect(() => {
        if (!isCritical) return;

        const animate = () => {
            const elapsed = Date.now() - startTime.current;
            const cycle = (elapsed % 1400) / 1400;

            setPulse(cycle);

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isCritical]);

    const scale = 1 + pulse * 2.5;
    const opacity = Math.max(1 - pulse, 0);

    return (
        <MapLibreGL.MarkerView coordinate={coordinate}>
            <View style={styles.container}>
                {/* Pulse ring */}
                {isCritical && (
                    <View
                        pointerEvents="none"
                        style={[
                            styles.pulse,
                            {
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                backgroundColor: color,
                                transform: [{ scale }],
                                opacity,
                            },
                        ]}
                    />
                )}

                {/* Core marker */}
                <TouchableOpacity
                    onPress={onPress}
                    style={[
                        styles.marker,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: color,
                        },
                    ]}
                />
            </View>
        </MapLibreGL.MarkerView>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
    marker: {
        borderWidth: 2,
        borderColor: "#fff",
        zIndex: 2,
    },
    pulse: {
        position: "absolute",
        zIndex: 1,
    },
});