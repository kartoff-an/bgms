export interface GeositeType {
    id: string;
    name: string;
    description: string;
}

export enum GeositeStatus {
    GOOD = "GOOD",
    MONITORING = "MONITORING",
    MODERATE = "MODERATE",
    CRITICAL = "CRITICAL",
}

export interface GeositeUpdate {
    name?: string;
    description?: string;
    typeId?: string;
    municipalityId?: string;
    latitude?: number;
    longitude?: number;
}

export interface Geosite {
    id: string;
    name: string;
    description?: string;
    coverPhotoUrl?: string;
    typeId: string;
    typeName?: string;
    overallStatus: GeositeStatus;
    municipalityId: string;
    municipalityName?: string;
    latitude?: number;
    longitude?: number;
    culturalSignificance?: string;
    geofenceRadius?: number;
    baselineCondition?: string;
    createdAt: string;
    updatedAt: string;
}

export type GeositeCreate = Pick<
    Geosite,
    "name" | "description" | "typeId" | "municipalityId" | "latitude" | "longitude"
>;
