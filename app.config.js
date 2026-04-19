import 'dotenv/config';

export default {
  expo: {
    name: "Bohol Geopark",
    slug: "bgms",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/BGMS_icon_2.png",
    scheme: "bgms",
    userInterfaceStyle: "automatic",

    android: {
      package: "com.kartoffan.bgms",
      versionCode: 1,
      googleServicesFile: "./google-services.json",
      permissions: [
        "VIBRATE",
        "WAKE_LOCK",
        "ACCESS_NETWORK_STATE",
        "INTERNET",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ],
      adaptiveIcon: {
        backgroundColor: "#E6F4FE"
      },
      predictiveBackGestureEnabled: false,

      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAP_API_KEY
        }
      }
    },

    plugins: [
      "expo-router",
      "@maplibre/maplibre-react-native",
      "@rnmapbox/maps",
      "@react-native-firebase/app",
      "@react-native-firebase/messaging"
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },

    extra: {
      router: {},
      eas: {
        projectId: process.env.EXPO_PROJECT_ID
      }
    },

    owner: "kartoffan25s-organization"
  }
};