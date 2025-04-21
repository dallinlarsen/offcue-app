import NavFilterOption from "@/components/settings/NavFilterOption";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { getUserSettings } from "@/lib/db-source";
import { UserSettings } from "@/lib/types";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [accordiansOpen, setAccordiansOpen] = useState<string[]>(["filter"]);
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

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return userSettings ? (
    <ThemedContainer>
      <Box className="flex flex-row items-center mb-4">
        <Heading size="3xl">Settings</Heading>
      </Box>
      <Button
        size="xl"
        onPress={() => router.push("/settings/notifications-test")}
      >
        <ButtonText>Notifications Testing</ButtonText>
      </Button>
      <NavFilterOption
        navState={userSettings.filter_reminder_nav}
        open={accordiansOpen.includes("filter")}
        setOpen={(open) => setOpenHandler(open, "filter")}
      />
    </ThemedContainer>
  ) : (
    <ThemedContainer />
  );
}
