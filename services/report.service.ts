import { api } from "../api/client";
import { Page, Pageable } from "../types/common";
import { MonitoringReport, MonitoringReportCreate, MonitoringReportUpdate } from "../types/report";

export const monitoringReportService = {
    async create(dto: MonitoringReportCreate): Promise<MonitoringReport> {
        try {
            const response = await api.post<MonitoringReport>("/monitoring/reports", dto);
            return response.data;
        } catch (error: any) {
            console.error("Failed to create report:", error?.response?.data || error);
            throw error;
        }
    },

    async update(id: string, dto: MonitoringReportUpdate): Promise<MonitoringReport> {
        try {
            const response = await api.put<MonitoringReport>(`/monitoring/reports/${id}`, dto);
            return response.data;
        } catch (error: any) {
            console.error("Failed to update report:", error?.response?.data || error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        try {
            await api.delete(`/monitoring/reports/${id}`);
        } catch (error: any) {
            console.error("Failed to delete report:", error?.response?.data || error);
            throw error;
        }
    },

    async getById(id: string): Promise<MonitoringReport> {
        try {
            const response = await api.get<MonitoringReport>(`/monitoring/reports/${id}`);
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch report:", error?.response?.data || error);
            throw error;
        }
    },

    async getAll(): Promise<Page<MonitoringReport>> {
        try {
            const response = await api.get<Page<MonitoringReport>>(`/monitoring/reports`);
            return response.data;
        } catch (error: any) {
            console.log("Failed to fetch reports: ", error?.response?.data || error);
            throw error;
        }
    },

    async startReview(reportId: string, officerId: string): Promise<void> {
        try {
            await api.post(`/monitoring/reports/${reportId}/start-review`, null, {
                params: { officerId },
            });
        } catch (error: any) {
            console.error("Failed to start review:", error?.response?.data || error);
            throw error;
        }
    },

    async completeReview(
        reportId: string,
        officerId: string,
        approve: boolean,
    ): Promise<MonitoringReport> {
        try {
            const response = await api.post<MonitoringReport>(
                `/monitoring/reports/${reportId}/complete-review`,
                null,
                {
                    params: { officerId, approve },
                },
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to complete review:", error?.response?.data || error);
            throw error;
        }
    },

    async withdraw(reportId: string): Promise<void> {
        try {
            await api.post(`/monitoring/reports/${reportId}/withdraw`);
        } catch (error: any) {
            console.error("Failed to withdraw report:", error?.response?.data || error);
            throw error;
        }
    },

    async myReports(pageable?: Pageable): Promise<Page<MonitoringReport>> {
        try {
            const response = await api.get<Page<MonitoringReport>>(
                "/monitoring/reports/my-reports",
                {
                    params: pageable,
                },
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch my reports:", error?.response?.data || error);
            throw error;
        }
    },

    // async communityReports(pageable?: Pageable): Promise<Page<MonitoringReport>> {
    //     try {
    //         const response = await api.get<Page<MonitoringReport>>(
    //             "/monitoring/reports/community-reports",
    //             { params: pageable },
    //         );
    //         return response.data;
    //     } catch (error: any) {
    //         console.error("Failed to fetch community reports:", error?.response?.data || error);
    //         throw error;
    //     }
    // },

    async activeReports(pageable?: Pageable): Promise<Page<MonitoringReport>> {
        try {
            const response = await api.get<Page<MonitoringReport>>(
                "/monitoring/reports/active-reports",
                { params: pageable },
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch active reports:", error?.response?.data || error);
            throw error;
        }
    },

    async addMedia(reportId: string, mediaUrl: string): Promise<MonitoringReport> {
        try {
            const response = await api.post<MonitoringReport>(
                `/monitoring/reports/${reportId}/media?mediaUrl=${encodeURIComponent(mediaUrl)}`,
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to add media:", error?.response?.data || error);
            throw error;
        }
    },

    async removeMedia(reportId: string, mediaUrl: string): Promise<MonitoringReport> {
        try {
            const response = await api.delete<MonitoringReport>(
                `/monitoring/reports/${reportId}/media`,
                {
                    params: {
                        mediaUrl: mediaUrl,
                    },
                },
            );

            return response.data;
        } catch (error: any) {
            console.error("Failed to remove media:", error?.response?.data || error);
            throw error;
        }
    },

    async getCommunityFeed(
    filters: {
        filter?: 'recent' | 'in-municipality' | 'nearby' | 'in-geosite';
        geositeId?: string;
        municipalityId?: string;
        latitude?: number;
        longitude?: number;
        radius?: number;
        search?: string;
    },
    pageable: Pageable
): Promise<Page<MonitoringReport>> {
    const response = await api.get('/monitoring/reports/feed', {
        params: {
            ...filters,
            page: pageable.page,
            size: pageable.size,
        },
    });
    return response.data;
    },
    
async communityReports(pageable: Pageable): Promise<Page<MonitoringReport>> {
    return this.getCommunityFeed({ filter: 'recent' }, pageable);
},

async getNearbyReports(
    latitude: number,
    longitude: number,
    radiusKm: number,
    pageable: Pageable
): Promise<Page<MonitoringReport>> {
    return this.getCommunityFeed({
        filter: 'nearby',
        latitude,
        longitude,
        radius: radiusKm
    }, pageable);
},

async getReportsByMunicipality(
    municipalityId: string,
    pageable: Pageable
): Promise<Page<MonitoringReport>> {
    return this.getCommunityFeed({
        filter: 'in-municipality',
        municipalityId
    }, pageable);
},

async getReportsByGeosite(
    geositeId: string,
    pageable: Pageable
): Promise<Page<MonitoringReport>> {
    return this.getCommunityFeed({
        filter: 'in-geosite',
        geositeId
    }, pageable);
}
};
