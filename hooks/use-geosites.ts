import { useState, useEffect } from "react";
import { Geosite } from "@app/types/geosite";
import { geositeService } from "@app/services/geosite.service";

export const useGeosites = () => {
    const [geosites, setGeosites] = useState<Geosite[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGeosites = async () => {
        setLoading(true);
        try {
            const response = await geositeService.list();
            setGeosites(response.content);
            setTotalCount(response.totalElements);
            setError(null);
        } catch (error) {
            console.error("Failed to fetch geosites:", error);
            setError("Failed to load geosites");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGeosites();
    }, []);

    return { geosites, totalCount, loading, error, fetchGeosites };
};
