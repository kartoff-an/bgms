import React, { useState, useRef, useEffect } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@app/components/ui";
import { useThemeColor } from "@app/hooks/use-theme-color";
import { Geosite } from "@app/types/geosite";
import { useGeosites } from "@app/hooks/use-geosites";
import { ErrorDisplay } from "@app/components/error-display";

interface GeositeSearchProps {
    selectedGeosite: Geosite | null;
    onSelect: (geosite: Geosite) => void;
    onClear: () => void;
    error?: string;
}

export const GeositeSearch: React.FC<GeositeSearchProps> = ({
    selectedGeosite,
    onSelect,
    onClear,
    error,
}) => {
    const theme = useThemeColor();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Geosite[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const { geosites, loading } = useGeosites();

    const filterGeosites = (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = geosites.filter(
            (geosite) =>
                geosite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                geosite.municipalityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                geosite.typeName?.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        setSuggestions(filtered);
        setShowSuggestions(true);
    };

    useEffect(() => {
        if (selectedGeosite) {
            setQuery(selectedGeosite.name);
            setShowSuggestions(false);
        }
    }, [selectedGeosite]);

    useEffect(() => {
        if (!loading && query.trim()) {
            filterGeosites(query);
        }
    }, [geosites, loading]);

    const handleSearch = (text: string) => {
        setQuery(text);

        if (selectedGeosite) {
            onClear();
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            filterGeosites(text);
        }, 300);
    };

    const selectGeosite = (geosite: Geosite) => {
        onSelect(geosite);
        setQuery(geosite.name);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleFocus = () => {
        if (query.trim() && suggestions.length > 0) {
            setShowSuggestions(true);
        } else if (query.trim() && geosites.length > 0) {
            filterGeosites(query);
        }
    };

    const handleBlur = () => {
        // Delay hiding to allow selection
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    const handleClear = () => {
        onClear();
        setQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <View style={styles.container}>
            <ThemedText variant="primary" weight="semibold" size="md" style={styles.title}>
                Geosite
            </ThemedText>

            <View
                style={[
                    styles.searchContainer,
                    {
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.border,
                        borderWidth: 1,
                    },
                ]}
            >
                <Ionicons name="search" size={20} color={theme.textSecondary} />
                <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    placeholder="Search for a geosite..."
                    placeholderTextColor={theme.placeholder}
                    value={query}
                    onChangeText={handleSearch}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {(selectedGeosite || query) && (
                    <TouchableOpacity onPress={handleClear}>
                        <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {error && <ErrorDisplay message={error} />}

            {showSuggestions && (
                <View
                    style={[
                        styles.suggestionsContainer,
                        { backgroundColor: theme.card, borderColor: theme.border },
                    ]}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={theme.primary} />
                            <ThemedText variant="secondary" size="xs">
                                Loading geosites...
                            </ThemedText>
                        </View>
                    ) : suggestions.length === 0 && query.trim() ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={32} color={theme.textSecondary} />
                            <ThemedText variant="secondary" size="sm" style={{ marginTop: 8 }}>
                                No geosites found
                            </ThemedText>
                            <ThemedText variant="secondary" size="xs" style={{ marginTop: 4 }}>
                                Try a different search term
                            </ThemedText>
                        </View>
                    ) : (
                        <FlatList
                            data={suggestions}
                            keyExtractor={(item) => item.id}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.suggestionItem,
                                        { borderBottomColor: theme.border },
                                    ]}
                                    onPress={() => selectGeosite(item)}
                                >
                                    <View style={styles.suggestionInfo}>
                                        <ThemedText variant="primary" weight="medium" size="sm">
                                            {item.name}
                                        </ThemedText>
                                        {item.municipalityName && (
                                            <ThemedText variant="secondary" size="xs">
                                                {item.municipalityName}
                                            </ThemedText>
                                        )}
                                        {item.typeName && (
                                            <ThemedText variant="secondary" size="xs">
                                                Type: {item.typeName}
                                            </ThemedText>
                                        )}
                                    </View>
                                    <Ionicons
                                        name="location-outline"
                                        size={20}
                                        color={theme.primary}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    title: {
        marginBottom: 4,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    suggestionsContainer: {
        maxHeight: 300,
        borderWidth: 1,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: "hidden",
    },
    suggestionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
    },
    suggestionInfo: {
        flex: 1,
        gap: 2,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        gap: 8,
    },
    emptyContainer: {
        padding: 24,
        alignItems: "center",
    },
});