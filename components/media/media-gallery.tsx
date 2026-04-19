import React, { useState } from "react";
import {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ImageViewing from "react-native-image-viewing";
import { ThemedText, ThemedButton } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { Radius } from "@app/constants/theme";
import * as ImagePicker from "expo-image-picker";

interface MediaGalleryProps {
    mediaUrls: string[];
    isEditable?: boolean;
    onAddMedia?: (asset: ImagePicker.ImagePickerAsset) => Promise<void>;
    onRemoveMedia?: (mediaUrl: string) => Promise<void>;
    uploadingMedia?: Record<string, boolean>;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
    mediaUrls,
    isEditable = false,
    onAddMedia,
    onRemoveMedia,
    uploadingMedia = {},
}) => {
    const theme = useThemeColor();
    const [viewerVisible, setViewerVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const requestPermissions = async (): Promise<boolean> => {
        const camera = await ImagePicker.requestCameraPermissionsAsync();
        const gallery = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (camera.status !== "granted" || gallery.status !== "granted") {
            Alert.alert(
                "Permission required",
                "Camera and gallery permissions are required to add images",
            );
            return false;
        }
        return true;
    };

    const takePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0] && onAddMedia) {
            await onAddMedia(result.assets[0]);
        }
    };

    const pickFromLibrary = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            quality: 0.8,
            allowsMultipleSelection: false,
        });

        if (!result.canceled && result.assets[0] && onAddMedia) {
            await onAddMedia(result.assets[0]);
        }
    };

    const showImageOptions = () => {
        Alert.alert("Add Image", "Choose an option", [
            { text: "Cancel", style: "cancel" },
            { text: "Take Photo", onPress: takePhoto },
            { text: "Choose from Library", onPress: pickFromLibrary },
        ]);
    };

    const confirmRemove = (mediaUrl: string) => {
        Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: () => onRemoveMedia?.(mediaUrl),
            },
        ]);
    };

    if (mediaUrls.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="image-outline" size={40} color={theme.textSecondary} />
                <ThemedText variant="secondary" size="sm" style={{ marginTop: 8 }}>
                    No attached images
                </ThemedText>
                {isEditable && (
                    <ThemedButton
                        title="Add Images"
                        variant="outline"
                        size="sm"
                        onPress={showImageOptions}
                        style={styles.addButton}
                    />
                )}
            </View>
        );
    }

    return (
        <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mediaUrls.map((uri, idx) => (
                    <View key={idx} style={styles.imageContainer}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                setCurrentIndex(idx);
                                setViewerVisible(true);
                            }}
                        >
                            <Image source={{ uri }} style={styles.thumbnail} resizeMode="cover" />
                        </TouchableOpacity>
                        {isEditable && onRemoveMedia && (
                            <TouchableOpacity
                                style={[styles.removeButton, { backgroundColor: theme.surface }]}
                                onPress={() => confirmRemove(uri)}
                            >
                                <Ionicons name="close-circle" size={24} color={theme.danger} />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
                {isEditable && (
                    <TouchableOpacity
                        style={[
                            styles.addImageButton,
                            { backgroundColor: theme.inputBackground, borderColor: theme.border },
                        ]}
                        onPress={showImageOptions}
                    >
                        <Ionicons name="add" size={32} color={theme.primary} />
                        <ThemedText variant="secondary" size="xs" style={{ marginTop: 4 }}>
                            Add More
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {Object.keys(uploadingMedia).length > 0 && (
                <View style={styles.uploadingContainer}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <ThemedText variant="secondary" size="xs">
                        Uploading {Object.keys(uploadingMedia).length} image(s)...
                    </ThemedText>
                </View>
            )}

            <ImageViewing
                images={mediaUrls.map((uri) => ({ uri }))}
                imageIndex={currentIndex}
                visible={viewerVisible}
                onRequestClose={() => setViewerVisible(false)}
                swipeToCloseEnabled
                doubleTapToZoomEnabled
                presentationStyle="fullScreen"
            />
        </View>
    );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    imageContainer: {
        position: "relative",
        marginRight: 12,
    },
    thumbnail: {
        width: width * 0.7,
        height: 200,
        borderRadius: Radius.md,
    },
    removeButton: {
        position: "absolute",
        top: 8,
        right: 8,
        borderRadius: Radius.sm,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        padding: 4,
    },
    addImageButton: {
        width: width * 0.7,
        height: 200,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    emptyContainer: {
        height: 120,
        justifyContent: "center",
        alignItems: "center",
    },
    addButton: {
        marginTop: 12,
        paddingHorizontal: 20,
    },
    uploadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        gap: 8,
    },
});
