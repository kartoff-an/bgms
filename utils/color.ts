import { GeositeStatus } from "@app/types/geosite";

export const getGeositeStatusColor = (status: GeositeStatus) => {
    switch (status) {
        case GeositeStatus.GOOD:
            return "#16A34A";
        case GeositeStatus.MONITORING:
            return "#CA8A04"
        case GeositeStatus.MODERATE:
            return "#EA580C";
        case GeositeStatus.CRITICAL:
            return "#DC2626";
        default:
            return "#4B5563";
    }
};