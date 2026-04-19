import React from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColor } from "@app/hooks/use-theme-color";

export interface ThemedDividerProps {
    style?: any;
    inset?: boolean;
    insetLeft?: number;
    insetRight?: number;
}

export const ThemedDivider: React.FC<ThemedDividerProps> = ({
    style,
    inset = false,
    insetLeft = 16,
    insetRight = 16,
}) => {
    const theme = useThemeColor();

    return (
        <View
            style={[
                styles.divider,
                {
                    backgroundColor: theme.border,
                    marginLeft: inset ? insetLeft : 0,
                    marginRight: inset ? insetRight : 0,
                },
                style,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    divider: {
        height: 1,
    },
});
