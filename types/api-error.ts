export interface ApiError {
    status?: number;
    code?: string;
    message?: string;
    error?: string;
    timestamp?: string;
    path?: string;
    details?: Array<{
        field: string;
        message: string;
    }>;
}
