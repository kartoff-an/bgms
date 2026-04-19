import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
    currentStep,
    totalSteps,
    labels = ["Type", "Details", "Media"],
}) => {
    const theme = useThemeColor();

    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <View key={index} style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepCircle,
                                {
                                    backgroundColor: isActive
                                        ? theme.primary
                                        : isCompleted
                                          ? theme.success
                                          : theme.border,
                                },
                            ]}
                        >
                            <ThemedText
                                variant="primary"
                                size="xs"
                                weight="bold"
                                style={{
                                    color: isActive || isCompleted ? "#fff" : theme.textSecondary,
                                }}
                            >
                                {stepNumber}
                            </ThemedText>
                        </View>
                        <ThemedText
                            variant={isActive ? "primary" : "secondary"}
                            size="xs"
                            weight={isActive ? "medium" : "normal"}
                            style={styles.stepLabel}
                        >
                            {labels[index]}
                        </ThemedText>
                        {index < totalSteps - 1 && (
                            <View
                                style={[
                                    styles.stepLine,
                                    {
                                        backgroundColor:
                                            stepNumber < currentStep ? theme.success : theme.border,
                                    },
                                ]}
                            />
                        )}
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    stepItem: {
        flex: 1,
        alignItems: "center",
        position: "relative",
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    stepLabel: {
        textAlign: "center",
    },
    stepLine: {
        position: "absolute",
        top: 16,
        left: "50%",
        right: "-50%",
        height: 2,
        zIndex: -1,
    },
});
