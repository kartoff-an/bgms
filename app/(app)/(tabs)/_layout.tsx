import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useThemeColor } from "@app/hooks/use-theme-color";

export default function TabLayout() {
    const theme = useThemeColor();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,

                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textSecondary,

                tabBarStyle: {
                    position: "absolute",
                    height: 70,
                    paddingBottom: Platform.OS === "ios" ? 18 : 10,
                    paddingTop: 8,

                    backgroundColor: theme.backgroundGradient[0],
                    borderTopWidth: 0,

                    shadowColor: theme.shadow,
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 10,

                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                },

                headerStyle: {
                    backgroundColor: theme.backgroundGradient[0],
                },

                headerTitleStyle: {
                    color: theme.textPrimary,
                    fontWeight: "600",
                },

                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home-outline" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="reports"
                options={{
                    title: "Reports",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="file-tray-full-outline" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="maps"
                options={{
                    title: "Maps",
                    tabBarIcon: () => null,
                    tabBarButton: (props) => <CenterMapButton {...props} />,
                }}
            />

            <Tabs.Screen
                name="community-feed"
                options={{
                    title: "Community Feed",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="newspaper-outline" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="settings-outline" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

function CenterMapButton(props: any) {
    const theme = useThemeColor();

    return (
        <TouchableOpacity {...props} activeOpacity={0.9} style={styles.centerButtonWrapper}>
            <View
                style={[
                    styles.centerButton,
                    {
                        backgroundColor: theme.primary,
                        shadowColor: theme.shadow,
                    },
                ]}
            >
                <Ionicons name="map" size={28} color="#ffffff" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    centerButtonWrapper: {
        top: -22,
        justifyContent: "center",
        alignItems: "center",
    },

    centerButton: {
        width: 66,
        height: 66,
        borderRadius: 33,
        justifyContent: "center",
        alignItems: "center",

        elevation: 8,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },
});
