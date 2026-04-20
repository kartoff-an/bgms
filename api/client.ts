import axios, { AxiosError } from "axios";
import { ApiError } from "../types/api-error";
import { ErrorHandler } from "../utils/error-handler";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((request) => {
    console.log("===== API REQUEST =====");
    console.log("METHOD:", request.method?.toUpperCase());
    console.log("BASE URL:", request.baseURL);
    console.log("URL:", request.url);

    if (request.params) {
        console.log("QUERY PARAMS:", request.params);
    }

    if (request.data) {
        console.log("REQUEST BODY:", request.data);
    }

    if (request.headers) {
        console.log("HEADERS:", request.headers);
    }

    console.log("=======================");

    return request;
});

api.interceptors.response.use(
    (response) => {
        console.log("RESPONSE:", response.status, response.config.url, response.data);
        return response;
    },
    (error: AxiosError<ApiError>) => {
        const standardizedError = ErrorHandler.handle(error);

        if (standardizedError.status === 401) {
            // Session expired or invalid
            window.location.href = "/login";
            return Promise.reject(standardizedError);
        }

        return Promise.reject(standardizedError);
    },
);

export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

