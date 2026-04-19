import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText, ThemedButton } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { Radius } from "@app/constants/theme";
import { ReportStatus } from "@app/types/report";
import { monitoringReportService } from "@app/services/report.service";

interface ActionOption {
    status: ReportStatus;
    label: string;
    icon: string;
    color: string;
    description: string;
    apiMethod: (
        reportId: string,
        userId?: string,
        approve?: boolean,
        notes?: string,
    ) => Promise<any>;
    needsApproval?: boolean;
}

interface ReportActionsProps {
    currentStatus: ReportStatus;
    isOfficer: boolean;
    reportId: string;
    userId?: string;
    onActionComplete?: () => void;
    loading?: boolean;
}

export const ReportActions: React.FC<ReportActionsProps> = ({
    currentStatus,
    isOfficer,
    reportId,
    userId,
    onActionComplete,
    loading: externalLoading = false,
}) => {
    const theme = useThemeColor();
    const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null);
    const [notes, setNotes] = useState("");
    const [internalLoading, setInternalLoading] = useState(false);

    const loading = externalLoading || internalLoading;

    const getAvailableActions = (): ActionOption[] => {
        if (!isOfficer) {
            if (currentStatus === ReportStatus.PENDING) {
                return [
                    {
                        status: ReportStatus.WITHDRAWN,
                        label: "Withdraw Report",
                        icon: "close-circle",
                        color: theme.danger,
                        description: "Withdraw this report (cannot be undone)",
                        apiMethod: (reportId: string) => monitoringReportService.withdraw(reportId),
                    },
                ];
            }
            return [];
        }

        switch (currentStatus) {
            case ReportStatus.PENDING:
                return [
                    {
                        status: ReportStatus.UNDER_REVIEW,
                        label: "Start Review",
                        icon: "time",
                        color: theme.info,
                        description: "Begin reviewing this report",
                        apiMethod: (reportId: string, userId?: string) =>
                            monitoringReportService.startReview(reportId, userId!),
                    },
                ];
            case ReportStatus.UNDER_REVIEW:
                return [
                    {
                        status: ReportStatus.REVIEWED,
                        label: "Approve",
                        icon: "checkmark-circle",
                        color: theme.success,
                        description: "Approve this report as valid and complete",
                        needsApproval: true,
                        apiMethod: (reportId: string, userId?: string) =>
                            monitoringReportService.completeReview(reportId, userId!, true),
                    },
                    {
                        status: ReportStatus.REJECTED,
                        label: "Reject",
                        icon: "close-circle",
                        color: theme.danger,
                        description: "Reject this report as invalid or incomplete",
                        needsApproval: true,
                        apiMethod: (reportId: string, userId?: string) =>
                            monitoringReportService.completeReview(reportId, userId!, false),
                    },
                ];
            default:
                return [];
        }
    };

    const handleAction = async () => {
        if (!selectedAction) return;

        let confirmMessage = "";
        switch (selectedAction.status) {
            case ReportStatus.UNDER_REVIEW:
                confirmMessage = "Are you sure you want to start reviewing this report?";
                break;
            case ReportStatus.REVIEWED:
                confirmMessage = "Are you sure you want to APPROVE this report?";
                break;
            case ReportStatus.REJECTED:
                confirmMessage = "Are you sure you want to REJECT this report?";
                break;
            case ReportStatus.WITHDRAWN:
                confirmMessage = "Are you sure you want to withdraw this report?";
                break;
        }

        Alert.alert("Confirm Action", confirmMessage, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Confirm",
                style:
                    selectedAction.status === ReportStatus.REJECTED ||
                    selectedAction.status === ReportStatus.WITHDRAWN
                        ? "destructive"
                        : "default",
                onPress: async () => {
                    setInternalLoading(true);
                    try {
                        if (selectedAction.needsApproval) {
                            await selectedAction.apiMethod(
                                reportId,
                                userId,
                                selectedAction.status === ReportStatus.REVIEWED,
                                notes,
                            );
                        } else {
                            await selectedAction.apiMethod(reportId, userId);
                        }

                        let successMessage = "";
                        switch (selectedAction.status) {
                            case ReportStatus.UNDER_REVIEW:
                                successMessage = "Review started successfully.";
                                break;
                            case ReportStatus.REVIEWED:
                                successMessage = "Report has been approved successfully.";
                                break;
                            case ReportStatus.REJECTED:
                                successMessage = "Report has been rejected.";
                                break;
                            case ReportStatus.WITHDRAWN:
                                successMessage = "Report has been withdrawn.";
                                break;
                        }

                        Alert.alert("Success", successMessage);
                        onActionComplete?.();
                    } catch (err: any) {
                        console.error(err);
                        Alert.alert(
                            "Error",
                            err?.response?.data?.message || "Failed to update report status.",
                        );
                    } finally {
                        setInternalLoading(false);
                    }
                },
            },
        ]);
    };

    const actions = getAvailableActions();

    if (actions.length === 0) return null;

    return (
        <View style={styles.container}>
            <ThemedText variant="primary" weight="semibold" size="md" style={styles.title}>
                {isOfficer ? "Available Actions" : "Report Actions"}
            </ThemedText>

            <View style={styles.actionsList}>
                {actions.map((action) => {
                    const isSelected = selectedAction?.status === action.status;
                    return (
                        <TouchableOpacity
                            key={action.status}
                            style={[
                                styles.actionCard,
                                {
                                    backgroundColor: isSelected
                                        ? action.color + "20"
                                        : theme.inputBackground,
                                    borderColor: isSelected ? action.color : theme.border,
                                    borderWidth: 2,
                                },
                            ]}
                            onPress={() => setSelectedAction(action)}
                            disabled={loading}
                        >
                            <Ionicons
                                name={action.icon as any}
                                size={28}
                                color={isSelected ? action.color : theme.textSecondary}
                            />
                            <View style={styles.actionText}>
                                <ThemedText
                                    variant={isSelected ? "primary" : "secondary"}
                                    weight={isSelected ? "bold" : "medium"}
                                    size="md"
                                    style={isSelected && { color: action.color }}
                                >
                                    {action.label}
                                </ThemedText>
                                <ThemedText
                                    variant="secondary"
                                    size="xs"
                                    style={styles.description}
                                >
                                    {action.description}
                                </ThemedText>
                            </View>
                            {isSelected && (
                                <Ionicons name="checkmark-circle" size={24} color={action.color} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {isOfficer &&
                currentStatus === ReportStatus.UNDER_REVIEW &&
                selectedAction?.status !== ReportStatus.UNDER_REVIEW && (
                    <View style={styles.notesSection}>
                        <ThemedText
                            variant="secondary"
                            size="sm"
                            weight="medium"
                            style={styles.notesLabel}
                        >
                            Review Notes (Optional)
                        </ThemedText>
                        <TextInput
                            style={[
                                styles.notesInput,
                                {
                                    backgroundColor: theme.inputBackground,
                                    borderColor: theme.border,
                                    color: theme.textPrimary,
                                },
                            ]}
                            placeholder="Add any additional notes or feedback for the reporter..."
                            placeholderTextColor={theme.placeholder}
                            multiline
                            numberOfLines={4}
                            value={notes}
                            onChangeText={setNotes}
                            editable={!loading}
                        />
                    </View>
                )}

            <View style={styles.buttons}>
                <ThemedButton
                    title={selectedAction?.label || "Select an Action"}
                    variant={
                        selectedAction?.status === ReportStatus.REJECTED ? "danger" : "primary"
                    }
                    size="md"
                    onPress={handleAction}
                    disabled={!selectedAction || loading}
                    loading={loading}
                    fullWidth
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        marginBottom: 16,
    },
    actionsList: {
        gap: 12,
        marginBottom: 20,
    },
    actionCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: Radius.md,
        gap: 12,
    },
    actionText: {
        flex: 1,
    },
    description: {
        marginTop: 2,
    },
    notesSection: {
        marginBottom: 20,
    },
    notesLabel: {
        marginBottom: 8,
    },
    notesInput: {
        borderWidth: 1,
        borderRadius: Radius.md,
        padding: 12,
        fontSize: 14,
        textAlignVertical: "top",
        minHeight: 100,
    },
    buttons: {
        marginTop: 8,
    },
});
