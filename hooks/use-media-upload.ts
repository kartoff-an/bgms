import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadFileToS3 } from "@app/services/s3-uploader.service";
import { getPresignedUrl } from "@app/services/s3.service";

export type UploadContext = "reports" | "profile" | "geosite" | "general";

export interface UseMediaUploadOptions {
    onSuccess?: (fileUrl: string, context?: string) => void;
    onError?: (error: Error) => void;
    context?: UploadContext;
    customPath?: string;
    showAlerts?: boolean;
}

export const useMediaUpload = (options?: UseMediaUploadOptions) => {
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [overallUploading, setOverallUploading] = useState(false);

    const {
        onSuccess,
        onError,
        context = "general",
        customPath,
        showAlerts = true,
    } = options || {};

    const generateFilePath = (context: UploadContext, customId?: string): string => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);

        if (customPath) {
            return `${customPath}/${timestamp}_${randomStr}`;
        }

        switch (context) {
            case "reports":
                const reportId = customId || "unknown";
                return `reports/${reportId}/${timestamp}_${randomStr}`;
            case "profile":
                const userId = customId || "user";
                return `profiles/${userId}/${timestamp}_${randomStr}`;
            case "geosite":
                const geositeId = customId || "unknown";
                return `geosites/${geositeId}/${timestamp}_${randomStr}`;
            case "general":
            default:
                return `uploads/${context}/${timestamp}_${randomStr}`;
        }
    };

    const uploadSingleMedia = async (
        asset: ImagePicker.ImagePickerAsset,
        customContextId?: string,
    ): Promise<string> => {
        const uploadId = `${Date.now()}_${asset.fileName || "image"}`;
        setUploading((prev) => ({ ...prev, [uploadId]: true }));
        setOverallUploading(true);

        try {
            const fileExtension = asset.uri.split(".").pop() || "jpg";
            const mimeType = asset.mimeType || `image/${fileExtension}`;

            const filePath = generateFilePath(context, customContextId);
            const fileName = `${filePath}.${fileExtension}`;

            const { uploadUrl, fileUrl } = await getPresignedUrl(fileName, mimeType);
            await uploadFileToS3(uploadUrl, asset.uri, mimeType);

            if (showAlerts) {
                Alert.alert("Success", "Image uploaded successfully!");
            }

            onSuccess?.(fileUrl, context);
            return fileUrl;
        } catch (error) {
            console.error("Failed to upload image:", error);
            if (showAlerts) {
                Alert.alert("Error", "Failed to upload image. Please try again.");
            }
            onError?.(error as Error);
            throw error;
        } finally {
            setUploading((prev) => {
                const newState = { ...prev };
                delete newState[uploadId];
                return newState;
            });
            setOverallUploading(false);
        }
    };

    const uploadMultipleMedia = async (
        assets: ImagePicker.ImagePickerAsset[],
        customContextId?: string,
    ): Promise<string[]> => {
        const uploadPromises = assets.map((asset) => uploadSingleMedia(asset, customContextId));

        try {
            const results = await Promise.all(uploadPromises);
            if (showAlerts) {
                Alert.alert("Success", `Successfully uploaded ${results.length} images!`);
            }
            return results;
        } catch (error) {
            console.error("Failed to upload some images:", error);
            if (showAlerts) {
                Alert.alert("Error", "Some images failed to upload. Please try again.");
            }
            throw error;
        }
    };

    const uploadAndAddMedia = async (
        asset: ImagePicker.ImagePickerAsset,
        customContextId?: string,
    ) => {
        return uploadSingleMedia(asset, customContextId);
    };

    return {
        uploading,
        overallUploading,
        uploadSingleMedia,
        uploadMultipleMedia,
        uploadAndAddMedia,
    };
};

// Backward compatible hook for existing code
export const useReportMediaUpload = (reportId: string, onSuccess?: (fileUrl: string) => void) => {
    const { uploading, uploadAndAddMedia } = useMediaUpload({
        context: "reports",
        onSuccess: (fileUrl) => onSuccess?.(fileUrl),
        showAlerts: true,
    });

    const uploadWithReportId = async (asset: ImagePicker.ImagePickerAsset) => {
        return uploadAndAddMedia(asset, reportId);
    };

    return {
        uploading,
        uploadAndAddMedia: uploadWithReportId,
    };
};
