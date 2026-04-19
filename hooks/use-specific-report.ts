import { useState, useCallback } from "react";
import { MonitoringReport } from "@app/types/report";
import { monitoringReportService } from "@app/services/report.service";

interface UseReportReturn {
    report: MonitoringReport | null;
    loading: boolean;
    error: string | null;
    fetchReport: (id: string) => Promise<MonitoringReport | null>;
    updateReport: (id: string, data: Partial<MonitoringReport>) => Promise<MonitoringReport | null>;
    addMedia: (reportId: string, mediaUrl: string) => Promise<MonitoringReport | null>;
    removeMedia: (reportId: string, mediaUrl: string) => Promise<MonitoringReport | null>;
    withdrawReport: (reportId: string) => Promise<void>;
    startReview: (reportId: string, officerId: string) => Promise<void>;
    completeReview: (
        reportId: string,
        officerId: string,
        approve: boolean,
    ) => Promise<MonitoringReport | null>;
    refresh: () => Promise<void>;
    clearReport: () => void;
}

export const useReport = (): UseReportReturn => {
    const [report, setReport] = useState<MonitoringReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentId, setCurrentId] = useState<string | null>(null);

    const fetchReport = useCallback(async (id: string): Promise<MonitoringReport | null> => {
        setLoading(true);
        setError(null);
        setCurrentId(id);

        try {
            const response = await monitoringReportService.getById(id);
            setReport(response);
            setError(null);
            return response;
        } catch (error: any) {
            console.error("Failed to fetch report:", error);
            setError(error?.response?.data?.message || "Failed to load report");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateReport = useCallback(
        async (id: string, data: Partial<MonitoringReport>): Promise<MonitoringReport | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await monitoringReportService.update(id, data);
                setReport(response);
                setError(null);
                return response;
            } catch (error: any) {
                console.error("Failed to update report:", error);
                setError(error?.response?.data?.message || "Failed to update report");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const addMedia = useCallback(
        async (reportId: string, mediaUrl: string): Promise<MonitoringReport | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await monitoringReportService.addMedia(reportId, mediaUrl);
                setReport(response);
                setError(null);
                return response;
            } catch (error: any) {
                console.error("Failed to add media:", error);
                setError(error?.response?.data?.message || "Failed to add media");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const removeMedia = useCallback(
        async (reportId: string, mediaUrl: string): Promise<MonitoringReport | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await monitoringReportService.removeMedia(reportId, mediaUrl);
                setReport(response);
                setError(null);
                return response;
            } catch (error: any) {
                console.error("Failed to remove media:", error);
                setError(error?.response?.data?.message || "Failed to remove media");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const withdrawReport = useCallback(
        async (reportId: string): Promise<void> => {
            setLoading(true);
            setError(null);

            try {
                await monitoringReportService.withdraw(reportId);
                // Refresh the report after withdrawal
                if (currentId) {
                    await fetchReport(currentId);
                }
            } catch (error: any) {
                console.error("Failed to withdraw report:", error);
                setError(error?.response?.data?.message || "Failed to withdraw report");
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [currentId, fetchReport],
    );

    const startReview = useCallback(
        async (reportId: string, officerId: string): Promise<void> => {
            setLoading(true);
            setError(null);

            try {
                await monitoringReportService.startReview(reportId, officerId);
                // Refresh the report after starting review
                if (currentId) {
                    await fetchReport(currentId);
                }
            } catch (error: any) {
                console.error("Failed to start review:", error);
                setError(error?.response?.data?.message || "Failed to start review");
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [currentId, fetchReport],
    );

    const completeReview = useCallback(
        async (
            reportId: string,
            officerId: string,
            approve: boolean,
        ): Promise<MonitoringReport | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await monitoringReportService.completeReview(
                    reportId,
                    officerId,
                    approve,
                );
                setReport(response);
                setError(null);
                return response;
            } catch (error: any) {
                console.error("Failed to complete review:", error);
                setError(error?.response?.data?.message || "Failed to complete review");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const refresh = useCallback(async (): Promise<void> => {
        if (currentId) {
            await fetchReport(currentId);
        }
    }, [currentId, fetchReport]);

    const clearReport = useCallback(() => {
        setReport(null);
        setError(null);
        setCurrentId(null);
    }, []);

    // Auto-fetch if enabled and id is provided
    // Note: This is handled in the component, not here, to avoid complexity

    return {
        report,
        loading,
        error,
        fetchReport,
        updateReport,
        addMedia,
        removeMedia,
        withdrawReport,
        startReview,
        completeReview,
        refresh,
        clearReport,
    };
};
