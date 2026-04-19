import { useThemeColor } from "@app/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "./ui";
import { Radius } from "@app/constants/theme";

interface FilterChipProps {
    label: string;
    active: boolean;
    onPress: () => void;
    icon: keyof typeof Ionicons.glyphMap;
}

export default function FilterChip({ label, active, onPress, icon }: FilterChipProps) {
    const theme = useThemeColor();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.filterChip,
                {
                    backgroundColor: active ? theme.primary : theme.surface,
                    borderColor: active ? theme.primary : theme.border,
                },
            ]}
        >
            <Ionicons
                name={icon}
                size={16}
                color={active ? "#FFFFFF" : theme.textSecondary}
            />
            <ThemedText
                size="sm"
                weight={active ? "semibold" : "normal"}
                style={[styles.filterChipText, { color: active ? "#FFFFFF" : theme.textSecondary }]}
            >
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radius.lg,
        borderWidth: 1,
    },

    filterChipText: {
        fontSize: 13,
    },
})