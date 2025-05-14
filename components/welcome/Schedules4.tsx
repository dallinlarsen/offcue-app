import { ScrollView, TouchableOpacity } from "react-native";
import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { AddIcon, ChevronLeftIcon } from "../ui/icon";
import ReminderSummaryBox from "./ReminderSummaryBox";
import { Heading } from "../ui/heading";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { formatScheduleString } from "@/lib/utils/format";
import { useState } from "react";
import AddEditScheduleActionsheet from "../schedule/AddEditScheduleActionsheet";
import { InsertReminderModel } from "@/lib/reminders/reminders.types";
import Fade from "../Fade";
import { Box } from "../ui/box";
import { EXAMPLE_SCHEDULES } from '@/constants';

type Props = {
  onNext: (reminder: Partial<InsertReminderModel>) => void;
  onPrevious: (reminder: Partial<InsertReminderModel>) => void;
  reminder: Partial<InsertReminderModel>;
};

export default function Schedules4({ onNext, onPrevious, reminder }: Props) {
  const [newScheduleOpen, setNewScheduleOpen] = useState(false);

  function previousPressedHandler() {
    onPrevious(reminder);
  }

  return (
    <VStack className="justify-between flex-1">
      <ReminderSummaryBox reminder={reminder} />
      <Heading size="2xl" className="mt-3 mb-2">
        When do you want to be reminded?
      </Heading>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="md" className="mt-2">
          <Text size="2xl" className="leading-normal">
            You may not want to be reminded to do 5 pushups at 2am or to go for
            a walk outside when you are on your commute to work.{" "}
          </Text>
          <Text size="2xl" className="leading-normal">
            Schedules help you choose{" "}
            <Heading size="xl" className="font-quicksand-bold">
              when reminders should come{" "}
            </Heading>
            so that you can do them when you are
            <Heading size="xl" className="font-quicksand-bold">
              {" "}
              most likely to be successful and effective.
            </Heading>{" "}
          </Text>
        </VStack>
        <VStack className="mt-4">
          {EXAMPLE_SCHEDULES.map((schedule, idx) => (
            <Card key={idx} variant="filled" className="mb-2">
              <HStack className="justify-between items-center flex-wrap">
                <TouchableOpacity
                  onPress={() => onNext({ schedules: [schedule] })}
                  className="py-4 pl-4 -my-4 mr-4 -ml-4 flex-1"
                >
                  <HStack className="items-end flex-wrap -ml-2">
                    <Text
                      numberOfLines={1}
                      size="xl"
                      className="font-semibold ml-2"
                    >
                      {schedule.label}
                    </Text>
                    <Text className="ml-2">
                      {formatScheduleString(schedule)}
                    </Text>
                  </HStack>
                </TouchableOpacity>
              </HStack>
            </Card>
          ))}
        </VStack>
        <Box className="h-12" />
      </ScrollView>
      <Box>
        <Fade />
        <HStack space="sm">
          <Button
            className="flex-1"
            size="xl"
            variant="outline"
            onPress={previousPressedHandler}
          >
            <ButtonIcon as={ChevronLeftIcon} />
            <ButtonText>Previous</ButtonText>
          </Button>
          <Button
            size="xl"
            className="px-5"
            variant="outline"
            onPress={() => setNewScheduleOpen(true)}
          >
            <ButtonIcon as={AddIcon} />
            <ButtonText>Create My Own</ButtonText>
          </Button>
        </HStack>
      </Box>

      <AddEditScheduleActionsheet
        isOpen={newScheduleOpen}
        onClose={() => setNewScheduleOpen(false)}
        setIsOpen={setNewScheduleOpen}
        onSave={(schedule) => onNext({ schedules: [schedule] })}
      />
    </VStack>
  );
}
