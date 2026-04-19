import { useState, useCallback } from "react";
import { Page, Pageable } from "@app/types/common";
import { MonitoringReport } from "@app/types/report";
import { monitoringReportService } from "@app/services/report.service";

interface UseReportsOptions {
    autoFetch?: boolean;
    defaultPageable?: Pageable;
}

interface UseReportsReturn {
    page: Page<MonitoringReport> | null;
    report: MonitoringReport | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    fetchReports: (pageable?: Pageable) => Promise<void>;
    fetchReportById: (id: string) => Promise<MonitoringReport | null>;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    goToPage: (page: number) => Promise<void>;
    setPageSize: (size: number) => void;
    clearSelectedReport: () => void;
}

const createReportsHook = (
    fetchFunction: (pageable?: Pageable) => Promise<Page<MonitoringReport>>,
) => {
    return (options: UseReportsOptions = {}): UseReportsReturn => {
        const { autoFetch = true, defaultPageable = { page: 0, size: 10 } } = options;

        const [page, setPage] = useState<Page<MonitoringReport> | null>(null);
        const [report, setReport] = useState<MonitoringReport | null>(null);
        const [loading, setLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [currentPageable, setCurrentPageable] = useState<Pageable>(defaultPageable);

        const fetchReports = useCallback(
            async (pageable?: Pageable) => {
                const isRefreshing =
                    pageable?.page === 0 || (!pageable && currentPageable.page === 0);

                if (isRefreshing) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError(null);

                try {
                    const response = await fetchFunction(pageable || currentPageable);
                    setPage(response);
                    setCurrentPageable({ page: response.number, size: response.size });
                    setError(null);
                } catch (error: any) {
                    console.error("Failed to fetch reports:", error);
                    setError(error?.response?.data?.message || "Failed to load reports");
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            },
            [currentPageable],
        );

        const fetchReportById = useCallback(
            async (id: string): Promise<MonitoringReport | null> => {
                setLoading(true);
                setError(null);

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
            },
            [],
        );

        const loadMore = useCallback(async () => {
            if (!page || page.last || loading || refreshing) return;

            const nextPageable = { page: page.number + 1, size: page.size };
            setLoading(true);

            try {
                const response = await fetchFunction(nextPageable);
                setPage({
                    ...response,
                    content: [...page.content, ...response.content],
                });
                setCurrentPageable({ page: response.number, size: response.size });
            } catch (error: any) {
                console.error("Failed to load more reports:", error);
                setError(error?.response?.data?.message || "Failed to load more reports");
            } finally {
                setLoading(false);
            }
        }, [page, loading, refreshing]);

        const refresh = useCallback(async () => {
            if (report) {
                // If we have a selected report, refresh it
                await fetchReportById(report.id);
            } else {
                // Otherwise refresh the list
                await fetchReports({ page: 0, size: currentPageable.size });
            }
        }, [fetchReports, fetchReportById, currentPageable.size, report]);

        const goToPage = useCallback(
            async (newPage: number) => {
                if (!page) return;
                if (newPage === page.number || newPage < 0 || newPage >= page.totalPages) return;
                await fetchReports({ page: newPage, size: page.size });
            },
            [page, fetchReports],
        );

        const setPageSize = useCallback(
            (size: number) => {
                const newPageable = { page: 0, size };
                setCurrentPageable(newPageable);
                fetchReports(newPageable);
            },
            [fetchReports],
        );

        const clearSelectedReport = useCallback(() => {
            setReport(null);
        }, []);

        if (autoFetch && !page && !error && !report) {
            fetchReports(currentPageable);
        }

        return {
            page,
            report,
            loading,
            refreshing,
            error,
            fetchReports,
            fetchReportById,
            loadMore,
            refresh,
            goToPage,
            setPageSize,
            clearSelectedReport,
        };
    };
};

// Specific hooks
export const useMyReports = createReportsHook((pageable) =>
    monitoringReportService.myReports(pageable),
);

export const useCommunityReports = createReportsHook((pageable) =>
    monitoringReportService.communityReports(pageable),
);

export const useActiveReports = createReportsHook((pageable) =>
    monitoringReportService.activeReports(pageable),
);
