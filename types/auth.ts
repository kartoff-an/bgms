import { User } from "./user";

export type AuthClientType = "WEB" | "MOBILE";

export interface LoginRequest {
    email: string;
    password: string;
    authClientType: AuthClientType;
}

export interface SignUpForm {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    municipalityId: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: BigInteger;
    user: User;
}
