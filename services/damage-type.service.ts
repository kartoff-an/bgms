import { api } from "../api/client";
import { DamageType } from "../types/damage-type";

export const damageTypeService = {
    async delete(id: string): Promise<void> {
        await api.delete(`/v1/damage-types/${id}`);
    },

    async getById(id: string): Promise<DamageType> {
        const response = await api.get<DamageType>(`/damage-types/${id}`);
        return response.data;
    },

    async getAll(): Promise<DamageType[]> {
        const response = await api.get<DamageType[]>("/damage-types");
        return response.data;
    },
};
