import React from "react";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";
import { StyleProp, ViewStyle } from "react-native";
import { useThemeColor } from "@app/hooks/use-theme-color";

type ScreenWrapperProps = SafeAreaViewProps & {
    style?: StyleProp<ViewStyle>; // optional style override
    edges?: ("top" | "bottom" | "left" | "right")[]; // optional edges, default top+bottom
};

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    style,
    edges = ["top", "bottom"],
    ...props
}) => {
    const theme = useThemeColor();

    return (
        <SafeAreaView
            style={[{ flex: 1, backgroundColor: theme.backgroundGradient[0] }, style]}
            edges={edges}
            {...props}
        />
    );
};
