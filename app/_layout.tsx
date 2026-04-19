import React, { useEffect, useState } from "react";
import { AuthProvider } from "@app/contexts/auth.context";
import { Stack } from "expo-router";
import { AppState, Text, View } from "react-native";
import * as Location from "expo-location";
import { ThemeProvider } from "@app/contexts/theme.context";

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);

    // const updateLocation = async () => {
    //   const { status } = await Location.requestForegroundPermissionsAsync();

    //   if (status !== 'granted') return;

    //   const loc = await Location.getCurrentPositionAsync({
    //     accuracy: Location.Accuracy.High
    //   });

    //   await userSer
    // };

    // useEffect(() => {

    //   // // run when app starts
    //   // updateLocation();

    //   // // run when app returns to foreground
    //   // const subscription = AppState.addEventListener('change', state => {
    //   //   if (state === 'active') {
    //   //     updateLocation();
    //   //   }
    //   // });

    //   return () => subscription.remove();

    // }, []);

    useEffect(() => {
        setTimeout(() => {
            setIsReady(true);
        }, 100);
    }, []);

    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ThemeProvider>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(app)" options={{ headerShown: false }} />
                </Stack>
            </AuthProvider>
        </ThemeProvider>
    );
}
