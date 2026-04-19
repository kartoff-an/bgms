import React from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { ThemedText } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";

type AlertVariant = "confirm" | "info";

interface Props {
    visible: boolean;
    title: string;
    message: string;
    variant?: AlertVariant;

    onConfirm?: () => void;
    onCancel?: () => void;
    onClose?: () => void;

    confirmText?: string;
    cancelText?: string;
    closeText?: string;
}

export default function Alert({
    visible,
    title,
    message,
    variant = "confirm",
    onConfirm,
    onCancel,
    onClose,
    confirmText = "Confirm",
    cancelText = "Cancel",
    closeText = "Close",
}: Props) {

    const theme = useThemeColor();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.background }]}>

                    {/* Title */}
                    <ThemedText weight="bold" size="lg" style={styles.title}>
                        {title}
                    </ThemedText>

                    {/* Message */}
                    <ThemedText variant="secondary" style={styles.message}>
                        {message}
                    </ThemedText>

                    {/* Actions */}
                    <View style={styles.actions}>
                        {variant === "confirm" ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: theme.border }]}
                                    onPress={onCancel}
                                >
                                    <ThemedText>{cancelText}</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: theme.primary }]}
                                    onPress={onConfirm}
                                >
                                    <ThemedText style={{ color: "#FFF" }}>
                                        {confirmText}
                                    </ThemedText>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={onClose}
                            >
                                <ThemedText style={{ color: "#FFF" }}>
                                    {closeText}
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    container: {
        width: "100%",
        borderRadius: 16,
        padding: 20,
        gap: 12,
    },

    title: {
        textAlign: "center",
    },

    message: {
        textAlign: "center",
        lineHeight: 20,
    },

    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 10,
    },

    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
});