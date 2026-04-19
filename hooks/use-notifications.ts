import { useState, useEffect, useCallback } from "react";
import { getApp } from "@react-native-firebase/app";
import notifee, { AndroidImportance } from "@notifee/react-native";
import {
    getMessaging,
    getToken,
    onMessage,
    setBackgroundMessageHandler,
    requestPermission,
    AuthorizationStatus,
} from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "@app/services/user.service";
import { PermissionsAndroid, Platform } from "react-native";

const app = getApp();
const messaging = getMessaging(app);

const NOTIFICATION_ENABLED_KEY = "@notifications_enabled";

interface UseNotificationsReturn {
    hasPermission: boolean;
    fcmToken: string | null;
    lastMessage: any;
    notificationsEnabled: boolean;
    toggleNotifications: (enabled: boolean) => Promise<void>;
    showNotification: (title: string, body: string) => Promise<void>;
}

export function useNotifications(userId?: string): UseNotificationsReturn {
    const [hasPermission, setHasPermission] = useState(false);
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const DEFAULT_TITLE = "Monitoring Alert";
    const DEFAULT_BODY = "Check geosites near you. Be safe!";

    useEffect(() => {
        loadNotificationPreference();
    }, []);

    const loadNotificationPreference = async () => {
        try {
            const saved = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
            if (saved !== null) {
                setNotificationsEnabled(saved === "true");
            }
        } catch (error) {
            console.error("Failed to load notification preference:", error);
        }
    };

    const saveNotificationPreference = async (enabled: boolean) => {
        try {
            await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled.toString());
            setNotificationsEnabled(enabled);
        } catch (error) {
            console.error("Failed to save notification preference:", error);
        }
    };

    const showNotification = useCallback(
        async (title: string, body: string) => {
            if (!notificationsEnabled) {
                console.log("Notifications are disabled, skipping display");
                return;
            }

            const channelId = await notifee.createChannel({
                id: "geofence",
                name: "Geofence Alerts",
                importance: AndroidImportance.HIGH,
            });

            await notifee.displayNotification({
                title,
                body,
                android: {
                    channelId,
                    smallIcon: "ic_launcher",
                    pressAction: { id: "default" },
                },
            });
        },
        [notificationsEnabled],
    );

    const initFCM = useCallback(async () => {
        try {
            let enabled = false;

            if (Platform.OS === "android" && Platform.Version >= 33) {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                );

                enabled = result === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const authStatus = await requestPermission(messaging);
                enabled =
                    authStatus === AuthorizationStatus.AUTHORIZED ||
                    authStatus === AuthorizationStatus.PROVISIONAL;
            }

            setHasPermission(enabled);

            if (!enabled) return;

            const token = await getToken(messaging);
            setFcmToken(token);

            if (userId && token) {
                await userService.updateFCMToken(userId, token);
            }
        } catch (err) {
            console.warn("FCM init failed", err);
        }
    }, [userId]);
    const toggleNotifications = useCallback(async (enabled: boolean) => {
        await saveNotificationPreference(enabled);

        console.log(`Notifications ${enabled ? "enabled" : "disabled"} locally`);
    }, []);

    useEffect(() => {
        const unsubscribe = onMessage(messaging, async (remoteMessage) => {
            setLastMessage(remoteMessage);

            if (notificationsEnabled) {
                const title = String(
                    remoteMessage.data?.title ?? remoteMessage.notification?.title ?? DEFAULT_TITLE,
                );
                const body = String(
                    remoteMessage.data?.body ?? remoteMessage.notification?.body ?? DEFAULT_BODY,
                );
                await showNotification(title, body);
            } else {
                console.log("Notification received but disabled by user");
            }
        });
        return () => unsubscribe();
    }, [showNotification, notificationsEnabled]);

    useEffect(() => {
        setBackgroundMessageHandler(messaging, async (remoteMessage) => {
            console.log("Background message received:", remoteMessage);
            setLastMessage(remoteMessage);

            if (notificationsEnabled) {
                const title = String(
                    remoteMessage.data?.title ?? remoteMessage.notification?.title ?? DEFAULT_TITLE,
                );
                const body = String(
                    remoteMessage.data?.body ?? remoteMessage.notification?.body ?? DEFAULT_BODY,
                );
                await showNotification(title, body);
            } else {
                console.log("Background notification received but disabled by user");
            }
        });
    }, [notificationsEnabled, showNotification]);


    useEffect(() => {
        initFCM();
    }, [initFCM]);

    return {
        hasPermission,
        fcmToken,
        lastMessage,
        notificationsEnabled,
        toggleNotifications,
        showNotification,
    };
}
