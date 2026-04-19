import React from "react";
import { View, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText, ThemedButton } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";
import * as ImagePicker from "expo-image-picker";

interface MediaItem {
    uri: string;
    type: "image" | "video";
}

interface MediaPickerProps {
    media: MediaItem[];
    onAddMedia: (media: MediaItem[]) => void;
    onRemoveMedia: (index: number) => void;
    maxCount?: number;
    error?: string;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
    media,
    onAddMedia,
    onRemoveMedia,
    maxCount = 10,
    error,
}) => {
    const theme = useThemeColor();

    const requestPermissions = async () => {
        const camera = await ImagePicker.requestCameraPermissionsAsync();
        const gallery = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (camera.status !== "granted" || gallery.status !== "granted") {
            Alert.alert("Permission required", "Camera and gallery permissions are required");
            return false;
        }
        return true;
    };

    const pickFromGallery = async () => {
        const allowed = await requestPermissions();
        if (!allowed) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newMedia = result.assets.map((asset) => ({
                uri: asset.uri,
                type: "image" as const,
            }));
            const updated = [...media, ...newMedia].slice(0, maxCount);
            onAddMedia(updated);
        }
    };

    const takePhoto = async () => {
        const allowed = await requestPermissions();
        if (!allowed) return;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newMedia = { uri: result.assets[0].uri, type: "image" as const };
            const updated = [...media, newMedia].slice(0, maxCount);
            onAddMedia(updated);
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            "Add Image",
            "Choose an option",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Take Photo", onPress: takePhoto },
                { text: "Choose from Library", onPress: pickFromGallery },
            ],
            { cancelable: true },
        );
    };

    return (
        <View style={styles.container}>
            <ThemedText variant="primary" weight="semibold" size="md" style={styles.title}>
                Evidence / Media
            </ThemedText>

            <View style={styles.buttonRow}>
                <ThemedButton
                    title="Take Photo"
                    variant="primary"
                    size="sm"
                    onPress={takePhoto}
                    icon={<Ionicons name="camera" size={18} color="white" />}
                    style={styles.button}
                />
                <ThemedButton
                    title="Upload Media"
                    variant="outline"
                    size="sm"
                    onPress={pickFromGallery}
                    icon={<Ionicons name="images" size={18} color={theme.primary} />}
                    style={styles.button}
                />
            </View>

            {media.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.previewContainer}
                >
                    {media.map((item, index) => (
                        <View key={index} style={styles.previewItem}>
                            <Image source={{ uri: item.uri }} style={styles.previewImage} />
                            <TouchableOpacity
                                style={[styles.removeButton, { backgroundColor: theme.surface }]}
                                onPress={() => onRemoveMedia(index)}
                            >
                                <Ionicons name="close-circle" size={22} color={theme.danger} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}

            {media.length === 0 && (
                <TouchableOpacity
                    style={[styles.addButton, { borderColor: theme.border }]}
                    onPress={showImageOptions}
                >
                    <Ionicons name="cloud-upload-outline" size={32} color={theme.textSecondary} />
                    <ThemedText variant="secondary" size="sm">
                        Tap to add images
                    </ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    title: {
        marginBottom: 4,
    },
    error: {
        marginTop: 4,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
    },
    previewContainer: {
        marginTop: 8,
    },
    previewItem: {
        position: "relative",
        marginRight: 12,
    },
    previewImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
    },
    removeButton: {
        position: "absolute",
        top: -5,
        right: -5,
        borderRadius: 12,
    },
    addButton: {
        height: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
});
