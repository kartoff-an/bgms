import React from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { ThemedText } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { DamageType } from "@app/types/damage-type";
import { ErrorDisplay } from "@app/components/error-display";

interface DamageTypeSelectorProps {
    damageTypes: DamageType[];
    selectedType: DamageType | null;
    onSelect: (type: DamageType) => void;
    loading?: boolean;
    error?: string;
}

export const DamageTypeSelector: React.FC<DamageTypeSelectorProps> = ({
    damageTypes,
    selectedType,
    onSelect,
    loading = false,
    error,
}) => {
    const theme = useThemeColor();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <ThemedText variant="secondary" size="sm">
                    Loading damage types...
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ThemedText variant="primary" weight="semibold" size="md" style={styles.title}>
                Damage Type
            </ThemedText>

            <View style={styles.grid}>
                {damageTypes.map((type) => {
                    const isSelected = selectedType?.id === type.id;
                    return (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: isSelected ? theme.primary : "transparent",
                                    borderColor: isSelected ? theme.primary : theme.border,
                                    borderWidth: error && !isSelected ? 2 : 1,
                                },
                            ]}
                            onPress={() => onSelect(type)}
                        >
                            <ThemedText
                                size="sm"
                                weight={isSelected ? "medium" : "normal"}
                                style={{
                                    color: isSelected ? "#fff" : theme.textSecondary,
                                }}
                            >
                                {type.name}
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
        gap: 8,
    },
    title: {
        marginBottom: 4,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: "transparent",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 8,
    },
});