import { useState, useRef, useEffect } from "react";
import * as Location from "expo-location";

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    loading: boolean;
}

export const useLocation = () => {
    const [location, setLocation] = useState<LocationState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: true,
    });

    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    const requestPermissions = async (): Promise<boolean> => {
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status === "granted") return true;

        const request = await Location.requestForegroundPermissionsAsync();
        return request.status === "granted";
    };

    const getCurrentLocation = async () => {
        setLocation((prev) => ({ ...prev, loading: true }));

        try {
            const hasPermission = await requestPermissions();

            if (!hasPermission) {
                setLocation({
                    latitude: null,
                    longitude: null,
                    error: "Location permission denied",
                    loading: false,
                });
                return null;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const coords = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };

            setLocation({
                ...coords,
                error: null,
                loading: false,
            });

            return coords;
        } catch (error) {
            console.log("Location error:", error);

            setLocation({
                latitude: null,
                longitude: null,
                error: "Failed to get location",
                loading: false,
            });

            return null;
        }
    };

    const startWatching = async (onLocationUpdate?: (lat: number, lng: number) => void) => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10,
            },
            (newLocation) => {
                const { latitude, longitude } = newLocation.coords;

                setLocation({
                    latitude,
                    longitude,
                    error: null,
                    loading: false,
                });

                onLocationUpdate?.(latitude, longitude);
            },
        );
    };

    const stopWatching = () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    };

    useEffect(() => {
        return () => stopWatching();
    }, []);

    return {
        location,
        getCurrentLocation,
        startWatching,
        stopWatching,
        requestPermissions,
    };
};
