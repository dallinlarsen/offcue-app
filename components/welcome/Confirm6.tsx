import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { ChevronRightIcon } from "../ui/icon";
import { Reminder } from "@/lib/reminders/reminders.types";
import ReminderSelectCard from "../reminder/ReminderSelectCard";
import { useEffect, useState } from "react";
import { getReminder } from "@/lib/reminders/reminders.service";
import { Box } from "../ui/box";
import { Heading } from "../ui/heading";

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
        {reminder && (
          <Box className="flex flex-row gap-4 mb-4">
            <ReminderSelectCard reminder={reminder} displayOnly />
            <Box className="p-3 flex-1 aspect-square opacity-0" />
          </Box>
        )}
      </VStack>
      <Button size="xl" onPress={nextPressedHandler}>
        <ButtonText>Next</ButtonText>
        <ButtonIcon as={ChevronRightIcon} />
      </Button>
    </VStack>
  );
}
