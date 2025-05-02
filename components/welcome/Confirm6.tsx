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

type Props = {
  onNext: () => void;
  reminderId: number | null;
};

export default function Confirm6({ onNext, reminderId }: Props) {
  const [reminder, setReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    async function fetchReminder() {
      if (reminderId) setReminder(await getReminder(reminderId));
    }
    fetchReminder();
  }, [reminderId]);

  function nextPressedHandler() {
    onNext();
  }

  return (
    <VStack className="justify-between flex-1">
      <VStack space="md">
        <Heading size="2xl">You Created A Reminder!</Heading>
        <ScrollView showsVerticalScrollIndicator={false}>
          {reminder && (
            <Box
              className="my-6"
              style={{ marginLeft: "25%", marginRight: "-25%" }}
            >
              <Box className="flex flex-row gap-4 mb-4">
                <ReminderSelectCard reminder={reminder} displayOnly />
                <Box className="p-3 flex-1 aspect-square opacity-0" />
              </Box>
            </Box>
          )}
          <Heading size="xl" className="font-quicksand-bold">
            Contratulations! 🥳
          </Heading>
          <Text size="xl" className="leading-normal mb-2">
            If you would like to go through this tutorial again it is always
            available in the settings menu. Choose what to do next! 👇
          </Text>
          <MenuOption
            text="☝️ Create another reminder"
            onPress={nextPressedHandler}
          />
          <MenuOption
            text="🗓️ Add more schedules"
            onPress={nextPressedHandler}
          />
          <MenuOption
            text="🎓 Do this tutorial again"
            onPress={nextPressedHandler}
          />
          <MenuOption
            text="🤔 Learn more about offcue"
            onPress={nextPressedHandler}
          />
          <MenuOption
            text="📋 See all reminders"
            onPress={nextPressedHandler}
          />
          <Box className="h-24" />
        </ScrollView>
      </VStack>
    </VStack>
  );
}
