import React, { useState } from "react";
import { TextInput, View, TouchableOpacity, StyleSheet, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedText } from "./themed-text";
import { Radius } from "@app/constants/theme";
import { ErrorDisplay } from "../error-display";

export interface ThemedInputProps extends TextInputProps {
    icon?: keyof typeof Ionicons.glyphMap;
    showPasswordToggle?: boolean;
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({
    icon,
    showPasswordToggle = false,
    secureTextEntry = false,
    label,
    error,
    leftIcon,
    rightIcon,
    style,
    onFocus,
    onBlur,
    ...props
}) => {
    const theme = useThemeColor();
    const [showPassword, setShowPassword] = useState(!secureTextEntry);
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (event: any) => {
        setIsFocused(true);
        onFocus?.(event);
    };

    const handleBlur = (event: any) => {
        setIsFocused(false);
        onBlur?.(event);
    };

    const getBorderColor = () => {
        if (error) return theme.danger;
        if (isFocused) return theme.primary;
        return theme.border;
    };

    return (
        <View style={styles.container}>
            {label && (
                <ThemedText variant="secondary" size="sm" weight="medium" style={styles.label}>
                    {label}
                </ThemedText>
            )}
            <View
                style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: theme.inputBackground,
                        borderWidth: 1,
                        borderColor: getBorderColor(),
                    },
                ]}
            >
                {leftIcon ? (
                    <View style={styles.leftIcon}>{leftIcon}</View>
                ) : icon ? (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? theme.primary : theme.inputIcon}
                        style={styles.icon}
                    />
                ) : null}

                <TextInput
                    style={[
                        styles.input,
                        {
                            color: theme.textPrimary,
                            paddingRight: showPasswordToggle || rightIcon ? 44 : 16,
                            paddingLeft: leftIcon || icon ? 44 : 16,
                        },
                        style,
                    ]}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={theme.placeholder}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />

                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}

                {showPasswordToggle && (
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword((prev) => !prev)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={showPassword ? "eye-outline" : "eye-off-outline"}
                            size={20}
                            color={isFocused ? theme.primary : theme.inputIcon}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <ErrorDisplay message={error} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
    },
    inputWrapper: {
        borderRadius: Radius.md,
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        fontWeight: "500",
    },
    icon: {
        position: "absolute",
        left: 16,
        zIndex: 1,
    },
    leftIcon: {
        position: "absolute",
        left: 16,
        zIndex: 1,
    },
    rightIcon: {
        position: "absolute",
        right: 16,
        zIndex: 1,
    },
    eyeButton: {
        position: "absolute",
        right: 16,
        zIndex: 1,
    },
    errorText: {
        marginTop: 4,
        marginLeft: 4,
    },
});
