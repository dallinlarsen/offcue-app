import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import * as SQLite from "expo-sqlite";
import { createDatabase } from "@/lib/db-service";
import { markDoneSkipNotificationCategoryListener, setupAndConfigureNotifications } from "@/lib/device-notifications.service";

const db = SQLite.openDatabaseSync("reminders.db");

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useDrizzleStudio(db);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Quicksand-Light": require("../assets/fonts/Quicksand/Quicksand-Light.ttf"),
    "Quicksand-Regular": require("../assets/fonts/Quicksand/Quicksand-Regular.ttf"),
    "Quicksand-Medium": require("../assets/fonts/Quicksand/Quicksand-Medium.ttf"),
    "Quicksand-SemiBold": require("../assets/fonts/Quicksand/Quicksand-SemiBold.ttf"),
    "Quicksand-Bold": require("../assets/fonts/Quicksand/Quicksand-Bold.ttf"),
  });

  useEffect(() => {
    setupAndConfigureNotifications();
    const subscription = markDoneSkipNotificationCategoryListener();

    return () => subscription.remove();
  }, [])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      createDatabase();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode="dark">
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 px-4 pt-6 bg-background-light dark:bg-background-dark">
          <Stack
            screenOptions={{
              animation: "none",
            }}
          >
            <Stack.Screen name="new-reminder" />
            <Stack.Screen name="index" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
