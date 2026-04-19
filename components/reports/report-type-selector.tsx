import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { ReportType } from "@app/types/report";
import { ErrorDisplay } from "../error-display";

const REPORT_TYPES = Object.values(ReportType);

interface ReportTypeSelectorProps {
    selectedType: ReportType | null;
    onSelect: (type: ReportType) => void;
    error?: string;
}

export const ReportTypeSelector: React.FC<ReportTypeSelectorProps> = ({
    selectedType,
    onSelect,
    error,
}) => {
    const theme = useThemeColor();

    const getIcon = (type: ReportType): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case ReportType.INCIDENT:
                return "warning";
            case ReportType.MAINTENANCE:
                return "construct";
            case ReportType.MONITORING:
                return "analytics";
            case ReportType.EMERGENCY:
                return "alert-circle";
            default:
                return "calendar";
        }
    };

    return (
        <View style={styles.container}>
            <ThemedText variant="primary" weight="semibold" size="md" style={styles.title}>
                Select Report Type
            </ThemedText>
            <View style={styles.grid}>
                {REPORT_TYPES.map((type) => {
                    const isSelected = selectedType === type;
                    return (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: isSelected ? theme.primary : theme.card,
                                    borderColor: isSelected ? theme.primary : theme.border,
                                    borderWidth: isSelected ? 2 : 1,
                                },
                            ]}
                            onPress={() => onSelect(type)}
                        >
                            <Ionicons
                                name={getIcon(type)}
                                size={24}
                                color={isSelected ? "#fff" : theme.primary}
                            />
                            <ThemedText
                                variant={isSelected ? "primary" : "primary"}
                                weight="medium"
                                size="sm"
                                style={{ color: isSelected ? "#fff" : theme.textPrimary }}
                            >
                                {type}
                            </ThemedText>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {error && <ErrorDisplay message={error} />}
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
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    card: {
        width: "47%",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        gap: 8,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
        paddingHorizontal: 4,
    },
    errorText: {
        flex: 1,
        lineHeight: 18,
    },
});