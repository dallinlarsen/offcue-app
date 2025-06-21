import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import * as SQLite from "expo-sqlite";
import { ConfettiProvider } from "@/hooks/useConfetti";
import Navigation from "@/components/navigation/Navigation";
import { NotificationProvider } from "@/hooks/useNotifications";
import { initDatabase } from "@/lib/init/init.service";
import { getSettings } from "@/lib/settings/settings.service";
import { useRouteInfo } from "expo-router/build/hooks";
import { SettingsProvider } from "@/hooks/useSettings";
import KeyboardDoneButton from "@/components/KeyboardDoneButton";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";
import { $customerInfo } from "@/lib/revenue-cat/revenue-cat.store";
import { $settings } from "@/lib/settings/settings.store";
import { runNotificationMaintenance } from "@/lib/notifications/notifications.service";

const db = SQLite.openDatabaseSync("reminders.db");

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 200 });

export default function RootLayout() {
  const router = useRouter();
  const route = useRouteInfo();
  useDrizzleStudio(db);

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Quicksand-Light": require("../assets/fonts/Quicksand/Quicksand-Light.ttf"),
    "Quicksand-Regular": require("../assets/fonts/Quicksand/Quicksand-Regular.ttf"),
    "Quicksand-Medium": require("../assets/fonts/Quicksand/Quicksand-Medium.ttf"),
    "Quicksand-SemiBold": require("../assets/fonts/Quicksand/Quicksand-SemiBold.ttf"),
    "Quicksand-Bold": require("../assets/fonts/Quicksand/Quicksand-Bold.ttf"),
  });

  async function setupState() {
    await initDatabase();
    const settings = await getSettings();
    $settings.set(settings!);
    if (!settings?.has_completed_tutorial) {
      router.replace("/welcome");
    }

    Purchases.setLogLevel(LOG_LEVEL.ERROR);

    if (Platform.OS === "ios") {
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUE_CAT_APPLE_API_KEY || "",
      });
    } else if (Platform.OS === "android") {
      //  Purchases.configure({apiKey: <revenuecat_project_google_api_key>});
    }

    $customerInfo.set(await Purchases.getCustomerInfo());

    runNotificationMaintenance();

    setTimeout(() => SplashScreen.hideAsync(), 500);
  }

  useEffect(() => {
    if (loaded || error) {
      setupState();
    }
  }, [loaded, error]);

  useEffect(() => {
    Purchases.addCustomerInfoUpdateListener((info) => {
      $customerInfo.set(info);
    });
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <GluestackUIProvider>
        <ConfettiProvider>
          <NotificationProvider>
            <SafeAreaProvider>
              <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                <Stack
                  screenOptions={{
                    animation: "none",
                    headerShown: false,
                  }}
                />
                {!route.pathname.startsWith("/welcome") && <Navigation />}
                <KeyboardDoneButton />
              </SafeAreaView>
            </SafeAreaProvider>
          </NotificationProvider>
        </ConfettiProvider>
      </GluestackUIProvider>
    </SettingsProvider>
  );
}
