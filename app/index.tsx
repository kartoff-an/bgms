import "expo-router/entry";
import { Redirect } from "expo-router";
import { View, Text, Image } from "react-native";
import { useEffect } from "react";
import notifee, { EventType } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";

import { useAuth } from "@app/contexts/auth.context";
import { useLocation } from "@app/hooks/use-location";
import { useNotifications } from "@app/hooks/use-notifications";
import { userService } from "@app/services/user.service";

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log("BG FCM:", remoteMessage);
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    if (type === EventType.DISMISSED) {
        console.log('Notification dismissed', notification);
    } else if (type === EventType.PRESS) {
        console.log('Notification pressed', notification, pressAction);
    }
});

export default function App() {
    const { user, loading } = useAuth();
    const { getCurrentLocation } = useLocation();

    const { hasPermission, lastMessage } = useNotifications(user?.id);

    useEffect(() => {
        (async () => {
            if (!user || !hasPermission) return;

            const currentLocation = await getCurrentLocation();
            if (currentLocation) {
                userService.updateUserLocation(user.id, currentLocation);
            }
        })();
    }, [user, hasPermission]);

    useEffect(() => {
        if (lastMessage) {
            console.log("Foreground or background message received:", lastMessage);
        }
    }, [lastMessage]);

    if (loading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
            }}>
                <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#ffffff",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                    overflow: "hidden",
                }}>
                    <Image
                        source={require("@app/assets/images/BGMS_icon.png")}
                        style={{ width: "100%", height: "100%", borderRadius: 100 }}
                        resizeMode="contain"
                    />
                </View>

                <Text style={{ fontSize: 16, color: "#666" }}>
                    Loading...
                </Text>
            </View>
        );
    }

    if (!user) {
        return <Redirect href="./(auth)/login" />;
    }

    return <Redirect href="./(app)/maps" />;
}