import axios, { AxiosError } from "axios";
import { ApiError } from "@app/types/api-error";

export class ErrorHandler {
    static handle(error: unknown): ApiError {
        const apiError: ApiError = {
            status: 500,
            message: "An unexpected error occurred",
            timestamp: new Date().toISOString(),
        };

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiError>;

            if (axiosError.response) {
                const backendError = axiosError.response.data;

                apiError.status = axiosError.response.status;
                apiError.message =
                    backendError?.message || this.getDefaultMessage(axiosError.response.status);
                apiError.error = backendError?.error || axiosError.message;
                apiError.path = backendError?.path || axiosError.config?.url;
                apiError.details = backendError?.details;
                apiError.timestamp = backendError?.timestamp || new Date().toISOString();

                this.logError(apiError, axiosError);
            } else if (axiosError.request) {
                apiError.status = 0;
                apiError.message = "Network error: Unable to reach server";
                apiError.error = "NETWORK_ERROR";
                this.logError(apiError, axiosError);
            } else {
                apiError.message = axiosError.message;
                apiError.error = "REQUEST_SETUP_ERROR";
                this.logError(apiError, axiosError);
            }
        } else if (error instanceof Error) {
            apiError.message = error.message;
            apiError.error = error.name;
            this.logError(apiError);
        }

        return apiError;
    }

    static getAuthErrorMessage = (error: unknown): string => {
        const apiError = error as ApiError;

        if (apiError.status === 0) {
            return "Network error. Please check your connection.";
        }

        switch (apiError.status) {
            case 403:
                return "You don't have permission to perform this action.";
            case 404:
                return "Service unavailable. Please try again later.";
            case 409:
                return "An account with this email already exists.";
            case 422:
                if (apiError.details) {
                    return apiError.details
                        .map((detail) => `${detail.field}: ${detail.message}`)
                        .join(", ");
                }
                return "Validation failed. Please check your input.";
            case 429:
                return "Too many attempts. Please try again later.";
            case 500:
            case 502:
            case 503:
                return "Server error. Please try again later.";
            default:
                return apiError.message || "An unexpected error occurred. Please try again.";
        }
    };

    private static getDefaultMessage(statusCode: number): string {
        switch (statusCode) {
            case 400:
                return "Bad request";
            case 401:
                return "Unauthorized";
            case 403:
                return "Forbidden";
            case 404:
                return "Resource not found";
            case 409:
                return "Conflict";
            case 422:
                return "Validation failed";
            case 429:
                return "Too many requests";
            case 500:
                return "Internal server error";
            case 502:
                return "Bad gateway";
            case 503:
                return "Service unavailable";
            default:
                return "An error occurred";
        }
    }

    private static logError(apiError: ApiError, axiosError?: AxiosError): void {
        console.error("[Error]", apiError.message);
    }
}
