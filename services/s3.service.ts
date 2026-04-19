import { api } from "../api/client";

export interface PresignedUrlResponse {
    uploadUrl: string;
    fileUrl: string;
}

export const getPresignedUrl = async (
    fileName: string,
    contentType: string,
): Promise<PresignedUrlResponse> => {
    const response = await api.get("/storage/presigned-url", {
        params: {
            fileName,
            contentType,
        },
    });

    return response.data;
};
