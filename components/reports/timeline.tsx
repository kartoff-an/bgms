import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";

interface TimelineItem {
    id?: string;
    action: string;
    performedAt: string;
    performedBy: string;
    performedByName?: string;
    description?: string;
}

const getTimelineActionConfig = (action: string) => {
    const configs: Record<string, { icon: any; color: string; label: string }> = {
        CREATED: { icon: "checkmark-circle", color: "#27AE60", label: "Report Created" },
        EDITED: { icon: "create-outline", color: "#3498DB", label: "Report Edited" },
        STATUS_CHANGED: { icon: "swap-horizontal", color: "#F2994A", label: "Status Changed" },
        VALIDATED: { icon: "checkmark-done-circle", color: "#27AE60", label: "Report Validated" },
        REJECTED: { icon: "close-circle", color: "#EB5757", label: "Report Rejected" },
        WITHDRAWN: { icon: "arrow-undo-circle", color: "#828282", label: "Report Withdrawn" },
        MEDIA_ADDED: { icon: "image", color: "#9B59B6", label: "Media Added" },
        MEDIA_REMOVED: { icon: "trash", color: "#E67E22", label: "Media Removed" },
    };
    return configs[action] || { icon: "time", color: "#95A5A6", label: action };
};

interface TimelineProps {
    items: TimelineItem[];
    initialLimit?: number;
}

export const Timeline: React.FC<TimelineProps> = ({ items, initialLimit = 4 }) => {
    const theme = useThemeColor();
    const [showFull, setShowFull] = useState(false);

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={40} color={theme.textSecondary} />
                <ThemedText variant="secondary" size="sm" style={{ marginTop: 8 }}>
                    No timeline entries available
                </ThemedText>
            </View>
        );
    }

    const displayedItems = showFull ? items : items.slice(0, initialLimit);
    const hasMore = items.length > initialLimit;

    return (
        <View>
            <View style={styles.container}>
                {displayedItems.map((item, index) => {
                    const config = getTimelineActionConfig(item.action);
                    const performedDate = new Date(item.performedAt);
                    const isToday = performedDate.toDateString() === new Date().toDateString();
                    const isLast = index === displayedItems.length - 1;

                    return (
                        <View key={item.id || index} style={styles.item}>
                            {!isLast && (
                                <View style={[styles.line, { backgroundColor: theme.border }]} />
                            )}
                            <View style={[styles.node, { backgroundColor: config.color }]}>
                                <Ionicons name={config.icon} size={14} color="#fff" />
                            </View>
                            <View style={styles.content}>
                                <View style={styles.header}>
                                    <ThemedText variant="primary" weight="semibold" size="sm">
                                        {config.label}
                                    </ThemedText>
                                    <ThemedText variant="secondary" size="xs" style={styles.date}>
                                        {isToday
                                            ? performedDate.toLocaleTimeString([], {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              })
                                            : performedDate.toLocaleDateString()}
                                    </ThemedText>
                                </View>
                                <ThemedText variant="secondary" size="xs" style={styles.user}>
                                    <Ionicons
                                        name="person-outline"
                                        size={10}
                                        color={theme.textSecondary}
                                    />{" "}
                                    {item.performedByName || item.performedBy}
                                </ThemedText>
                                {item.description && (
                                    <ThemedText
                                        variant="secondary"
                                        size="xs"
                                        style={styles.description}
                                    >
                                        {item.description}
                                    </ThemedText>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>

            {hasMore && (
                <TouchableOpacity onPress={() => setShowFull(!showFull)} style={styles.showMore}>
                    <ThemedText
                        variant="primary"
                        size="sm"
                        weight="medium"
                        style={{ color: theme.primary }}
                    >
                        {showFull ? "Show Less" : `Show ${items.length - initialLimit} More`}
                    </ThemedText>
                    <Ionicons
                        name={showFull ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={theme.primary}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        position: "relative",
    },
    item: {
        flexDirection: "row",
        marginBottom: 24,
        position: "relative",
    },
    line: {
        position: "absolute",
        left: 11,
        top: 24,
        bottom: -24,
        width: 2,
    },
    node: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        zIndex: 1,
    },
    content: {
        flex: 1,
        marginLeft: 4,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: 4,
    },
    date: {
        fontSize: 11,
    },
    user: {
        marginBottom: 4,
    },
    description: {
        marginTop: 4,
        lineHeight: 16,
    },
    emptyContainer: {
        padding: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    showMore: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        gap: 4,
    },
});
