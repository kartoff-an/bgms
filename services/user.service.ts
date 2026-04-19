import { api } from "../api/client";
import type { User, UserProfileUpdate } from "../types/user";
import type { UserRole, UserStatus, UserUpdate } from "../types/user";

interface GetUsersParams {
    role?: UserRole;
    status?: UserStatus;
    municipalityId?: string;
}

export const userService = {
    async getById(id: string): Promise<User> {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    async getAll(params?: GetUsersParams): Promise<User[]> {
        const response = await api.get<User[]>("/users", { params });
        return response.data;
    },

    async update(id: string, updateData: UserUpdate): Promise<User> {
        const response = await api.put<User>(`/users/${id}`, updateData);
        return response.data;
    },

    async updateProfile(id: string, updateData: UserProfileUpdate): Promise<User> {
        const response = await api.put<User>(`/users/profile/${id}`, updateData);
        return response.data;
    },

    async updateFCMToken(id: string, token: string): Promise<void> {
        await api.put(`/users/${id}/fcm-token`, null, {
            params: { token },
        });
    },

    async updateUserLocation(
        id: string,
        location: {
            longitude: number;
            latitude: number;
        },
    ): Promise<User> {
        const response = await api.put<User>(`/users/${id}/location`, location);
        return response.data;
    },

    async removeFCMToken(id: string): Promise<void> {
        await api.delete(`/users/${id}/fcmToken`);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },
};
