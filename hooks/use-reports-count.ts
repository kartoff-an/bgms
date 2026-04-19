import { useState, useEffect } from "react";
import { monitoringReportService } from "@app/services/report.service";

interface UseReportsCountReturn {
    count: number;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useActiveReportsCount = (): UseReportsCountReturn => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCount = async () => {
        setLoading(true);
        try {
            const response = await monitoringReportService.activeReports({
                page: 0,
                size: 1,
            });
            setCount(response.totalElements);
            setError(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to fetch count");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCount();
    }, []);

    return { count, loading, error, refetch: fetchCount };
};

export const useMyReportsCount = (): UseReportsCountReturn => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCount = async () => {
        setLoading(true);
        try {
            const response = await monitoringReportService.myReports({
                page: 0,
                size: 1,
            });
            setCount(response.totalElements);
            setError(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to fetch count");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCount();
    }, []);

    return { count, loading, error, refetch: fetchCount };
};

export const useCommunityReportsCount = (): UseReportsCountReturn => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCount = async () => {
        setLoading(true);
        try {
            const response = await monitoringReportService.communityReports({
                page: 0,
                size: 1,
            });
            setCount(response.totalElements);
            setError(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to fetch count");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCount();
    }, []);

    return { count, loading, error, refetch: fetchCount };
};
