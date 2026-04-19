import { Colors } from "@app/constants/theme";
import { useTheme } from "@app/contexts/theme.context";

export function useThemeColor() {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? "dark" : "light";
    return Colors[theme];
}
