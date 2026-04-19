import React from "react";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";
import { StyleProp, ViewStyle } from "react-native";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedView } from "./themed-view";

interface ThemedScreenWrapperProps extends SafeAreaViewProps {
    style?: StyleProp<ViewStyle>;
    edges?: ("top" | "bottom" | "left" | "right")[];
    scrollable?: boolean;
}

export const ThemedScreenWrapper: React.FC<ThemedScreenWrapperProps> = ({
    style,
    edges = ["top", "bottom"],
    scrollable = false,
    children,
    ...props
}) => {
    const theme = useThemeColor();

    if (scrollable) {
        return (
            <SafeAreaView
                style={[{ flex: 1, backgroundColor: theme.background }, style]}
                edges={edges}
                {...props}
            >
                <ThemedView variant="default" style={{ flex: 1 }}>
                    {children}
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[{ flex: 1, backgroundColor: theme.background }, style]}
            edges={edges}
            {...props}
        >
            {children}
        </SafeAreaView>
    );
};
