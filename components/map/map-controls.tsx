import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { Elevation } from "@app/constants/theme";

interface MapControlProps {
    icon: string;
    onPress: () => void;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    color?: string;
    disabled?: boolean;
    offset?: number;
}

export const MapControl: React.FC<MapControlProps> = ({
    icon,
    onPress,
    position,
    color,
    disabled = false,
    offset = 0,
}) => {
    const theme = useThemeColor();

    const getPositionStyle = () => {
        const basePosition = 20;
        switch (position) {
            case "top-left":
                return { top: basePosition + offset, left: basePosition };
            case "top-right":
                return { top: basePosition + offset, right: basePosition };
            case "bottom-left":
                return { bottom: basePosition + offset, left: basePosition };
            case "bottom-right":
                return { bottom: basePosition + offset, right: basePosition };
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.control,
                getPositionStyle(),
                {
                    backgroundColor: theme.surface,
                    ...Elevation.md,
                },
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <MaterialIcons name={icon as any} size={24} color={color || theme.primary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    control: {
        position: "absolute",
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
});
