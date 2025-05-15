import DarkMode from "@/components/settings/DarkMode";
import GetHelp from "@/components/settings/GetHelp";
import WelcomeTutorial from "@/components/settings/WelcomeTutorial";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { ChevronRightIcon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { getSettings } from "@/lib/settings/settings.source";
import { Settings } from "@/lib/settings/settings.types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function SettingsScreen() {
  const router = useRouter();

  const [accordiansOpen, setAccordiansOpen] = useState<string[]>([
    "dark-mode",
    "welcome-tutorial",
    "help",
  ]);
  const [settings, setSettings] = useState<Settings | null>(null);

  function setOpenHandler(open: boolean, key: string) {
    if (open && !accordiansOpen.includes(key)) {
      setAccordiansOpen([...accordiansOpen, key]);
    } else {
      setAccordiansOpen(accordiansOpen.filter((k) => k !== key));
    }
  }

  async function loadSettings() {
    setSettings(await getSettings());
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return settings ? (
    <ThemedContainer>
      <Box className="flex flex-row items-center mb-1">
        <Heading size="2xl">Settings</Heading>
      </Box>
      <VStack space="lg">
        <DarkMode
          theme={settings.theme}
          open={accordiansOpen.includes("dark-mode")}
          setOpen={(open) => setOpenHandler(open, "dark-mode")}
        />
        <WelcomeTutorial
          open={accordiansOpen.includes("welcome-tutorial")}
          setOpen={(open) => setOpenHandler(open, "welcome-tutorial")}
        />
        <GetHelp
          open={accordiansOpen.includes("help")}
          setOpen={(open) => setOpenHandler(open, "help")}
        />
        {/* <Button
          size="xl"
          className="mt-8"
          onPress={() => router.push("/settings/notifications-test")}
        >
          <ButtonText>Notifications Testing</ButtonText>
          <ButtonIcon as={ChevronRightIcon} />
        </Button> */}
      </VStack>
    </ThemedContainer>
  ) : (
    <ThemedContainer />
  );
}
