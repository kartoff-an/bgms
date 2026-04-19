export enum UserRole {
    ADMIN = "ADMIN",
    OFFICER = "OFFICER",
    WARDEN = "WARDEN",
}

export type UserStatus = "ACTIVE" | "UNVERIFIED" | "INACTIVE" | "DISABLED" | "UNKNOWN";

export interface User {
    id: string;
    email: string;
    fullName: string;
    profileImage: string;
    role: UserRole;
    status: UserStatus;
    phoneNumber: string;
    municipalityId?: string | null;
    municipalityName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserUpdate {
    fullName?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
    municipalityId?: string | null;
}

export interface UserProfileUpdate {
    fullName?: string | null,
    phoneNumber?: string | null,
    profileImage?: string | null
}

export interface UserCreate {
    fullName: string;
    email: string;
    password: string;
    municipalityId: string;
}
