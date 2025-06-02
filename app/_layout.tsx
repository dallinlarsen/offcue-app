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

const db = SQLite.openDatabaseSync("reminders.db");

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const route = useRouteInfo();
  useDrizzleStudio(db);

  const [loaded] = useFonts({
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
    if (!settings?.has_completed_tutorial) {
      router.replace("/welcome");
    }
    setTimeout(() => SplashScreen.hideAsync(), 1000);
  }

  useEffect(() => {
    if (loaded) {
      setupState();
    }
  }, [loaded]);

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
