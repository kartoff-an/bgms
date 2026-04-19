import { Address } from "./address";

export enum ReportStatus {
    PENDING = "PENDING",
    UNDER_REVIEW = "UNDER_REVIEW",
    REVIEWED = "REVIEWED",
    REJECTED = "REJECTED",
    WITHDRAWN = "WITHDRAWN",
}

export interface ReportTimeline {
    id: string;
    action: string;
    description: string;
    performedBy: string;
    performedByName: string;
    performedAt: string;
}

export enum TimelineAction {
    CREATED = "CREATED",
    EDITED = "EDITED",
    STATUS_CHANGED = "STATUS_CHANGED",
    VALIDATED = "VALIDATED",
    REJECTED = "REJECTED",
    WITHDRAWN = "WITHDRAWN",
    MEDIA_ADDED = "MEDIA_ADDED",
    MEDIA_REMOVED = "MEDIA_REMOVED",
}

// interface Media{
//   uri: string;
//   type: "image" | "video";
//   latitude?: number;
//   longitude?: number;
// };

export enum ReportType {
    INCIDENT = "Incident",
    MAINTENANCE = "Maintenance",
    MONITORING = "Monitoring",
    EMERGENCY = "Emergency",
    ROUTINE = "Routine",
    OTHERS = "Others",
}

export interface MonitoringReportCreate {
    damageTypeName: string;
    damageDescription: string;
    reportType: ReportType;
    geositeId: string;
    latitude: number;
    longitude: number;
    medias: string[];
}

export interface MonitoringReportUpdate {
    damageTypeName?: string;
    damageDescription?: string;
    reportType?: ReportType;
    geositeId?: string;
    latitude?: number;
    longitude?: number;
    medias?: string[];
}

export interface MonitoringReport {
    id: string;
    submitterId: string;
    damageType: string;
    damageDescription: string;
    reportType: ReportType;
    geositeId: string;
    geositeName: string;
    latitude: number;
    longitude: number;
    address: Address;
    reportStatus: ReportStatus;
    validationDate: string;
    validatorName: string;
    medias: string[];
    timelines: ReportTimeline[];
    createdAt: string;
    updatedAt: string;
}
