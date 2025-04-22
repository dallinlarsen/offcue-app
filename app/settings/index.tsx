import DarkMode from "@/components/settings/DarkMode";
import NavFilterOption from "@/components/settings/NavFilterOption";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { ChevronRightIcon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { getUserSettings } from "@/lib/db-source";
import { UserSettings } from "@/lib/types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function SettingsScreen() {
  const router = useRouter();

  const [accordiansOpen, setAccordiansOpen] = useState<string[]>([
    "filter",
    "dark-mode",
  ]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  function setOpenHandler(open: boolean, key: string) {
    if (open && !accordiansOpen.includes(key)) {
      setAccordiansOpen([...accordiansOpen, key]);
    } else {
      setAccordiansOpen(accordiansOpen.filter((k) => k !== key));
    }
  }

  async function loadSettings() {
    setUserSettings(await getUserSettings());
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return userSettings ? (
    <ThemedContainer>
      <Box className="flex flex-row items-center mb-4">
        <Heading size="3xl">Settings</Heading>
      </Box>
      <VStack space="lg">
        <DarkMode
          theme={userSettings.theme}
          open={accordiansOpen.includes("dark-mode")}
          setOpen={(open) => setOpenHandler(open, "dark-mode")}
        />
        <NavFilterOption
          navState={userSettings.filter_reminder_nav}
          open={accordiansOpen.includes("filter")}
          setOpen={(open) => setOpenHandler(open, "filter")}
        />
        <Button
          size="xl"
          className="mt-8"
          onPress={() => router.push("/settings/notifications-test")}
        >
          <ButtonText>Notifications Testing</ButtonText>
          <ButtonIcon as={ChevronRightIcon} />
        </Button>
      </VStack>
    </ThemedContainer>
  ) : (
    <ThemedContainer />
  );
}
