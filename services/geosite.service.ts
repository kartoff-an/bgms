import { api } from "../api/client";
import { Page, Pageable } from "../types/common";
import type { GeositeCreate, Geosite, GeositeUpdate } from "../types/geosite";

export const geositeService = {
    async create(createData: GeositeCreate): Promise<Geosite> {
        const response = await api.post<Geosite>("/geosites", createData);
        return response.data;
    },

    async update(id: string, dto: GeositeUpdate): Promise<Geosite> {
        const response = await api.patch<Geosite>(`/geosites/${id}`, dto);
        return response.data;
    },

    async getById(id: string): Promise<Geosite> {
        const response = await api.get<Geosite>(`/geosites/${id}`);
        return response.data;
    },

    async list(
        pageable?: Pageable,
        typeId?: string,
        municipalityId?: string,
        name?: string,
    ): Promise<Page<Geosite>> {
        const params: {
            page?: number;
            size?: number;
            sort?: string;
            typeId?: string;
            municipalityId?: string;
            name?: string;
        } = { ...pageable };
        if (typeId) params.typeId = typeId;
        if (municipalityId) params.municipalityId = municipalityId;
        if (name) params.name = name;

        const response = await api.get<Page<Geosite>>("/geosites", {
            params,
        });
        console.log();
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/geosites/${id}`);
    },
};
