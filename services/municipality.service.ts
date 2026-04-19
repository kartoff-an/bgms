import { api } from "../api/client";
import { Municipality } from "../types/municipality";

export const municipalityService = {
    async getAll(): Promise<Municipality[]> {
        const { data } = await api.get<Municipality[]>("/municipalities");
        return data;
    },
};
