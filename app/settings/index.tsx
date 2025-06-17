import DarkMode from "@/components/settings/DarkMode";
import GetHelp from "@/components/settings/GetHelp";
import PurchaseUnlimited from "@/components/settings/PurchaseUnlimited";
import BackupRestore from "@/components/settings/BackupRestore";
import WelcomeTutorial from "@/components/settings/WelcomeTutorial";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { useState } from "react";
import { ScrollView } from "react-native";
import { useStore } from "@nanostores/react";
import { $settings } from "@/lib/settings/settings.store";

export default function SettingsScreen() {
  const settings = useStore($settings);

  const [accordiansOpen, setAccordiansOpen] = useState<string[]>([
    "dark-mode",
    "welcome-tutorial",
    "help",
  ]);

  function setOpenHandler(open: boolean, key: string) {
    if (open && !accordiansOpen.includes(key)) {
      setAccordiansOpen([...accordiansOpen, key]);
    } else {
      setAccordiansOpen(accordiansOpen.filter((k) => k !== key));
    }
  }

  return settings ? (
    <ThemedContainer>
      <Box className="flex flex-row items-center mb-1">
        <Heading size="2xl">Settings</Heading>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="mb-24">
          <PurchaseUnlimited />
          <DarkMode
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
          <BackupRestore
            open={accordiansOpen.includes("backup")}
            setOpen={(open) => setOpenHandler(open, "backup")}
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
      </ScrollView>
    </ThemedContainer>
  ) : (
    <ThemedContainer />
  );
}
