import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { ChevronRightIcon, Icon, SettingsIcon } from "../ui/icon";
import { Reminder } from "@/lib/reminders/reminders.types";
import ReminderSelectCard from "../reminder/ReminderSelectCard";
import { useEffect, useState } from "react";
import { getReminder } from "@/lib/reminders/reminders.service";
import { Box } from "../ui/box";
import { Heading } from "../ui/heading";
import { ScrollView, TouchableOpacity } from "react-native";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import MenuOption from "./MenuOption";
import { useRouter } from "expo-router";
import Fade from "../Fade";
import { useHasHomeButton } from "@/hooks/useHasHomeButton";
import * as WebBrowser from "expo-web-browser";

type Props = {
  onNext: () => void;
  onStartOver: () => void;
  reminderId: number | null;
};

export default function Confirm6({ onNext, onStartOver, reminderId }: Props) {
  const router = useRouter();
  const hasHomeButton = useHasHomeButton();
  const [reminder, setReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    async function fetchReminder() {
      if (reminderId) setReminder(await getReminder(reminderId));
    }
    fetchReminder();
  }, [reminderId]);

  async function openWebPage() {
    await WebBrowser.openBrowserAsync("https://offcue.app/docs");
  }

  return (
    <VStack className="justify-between flex-1">
      <VStack space="md">
        <Heading size="2xl">You Created a Reminder!</Heading>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Heading size="xl" className="font-quicksand-bold">
            Congratulations 🥳
          </Heading>
          <Text size="xl" className="leading-normal mb-4">
            If you would like to go through this tutorial again, it's always
            available in the settings menu. Choose what to do next! 👇
          </Text>

          <MenuOption
            text="☝️ Create another reminder"
            onPress={() => router.replace("/reminder/new")}
          />
          {/* <MenuOption
            text="🗓️ Add more schedules"
            onPress={onNext}
          /> */}
          <MenuOption text="🎓 Do this tutorial again" onPress={onStartOver} />
          <MenuOption text="🤔 Learn more about offcue" onPress={openWebPage} />
          <MenuOption
            text="✌️ Close this tutorial"
            onPress={() => router.dismissTo("/")}
          />
          <Box className="h-36" />
        </ScrollView>
      </VStack>
      <Fade className={hasHomeButton ? "-mb-3" : ""} />
    </VStack>
  );
}
