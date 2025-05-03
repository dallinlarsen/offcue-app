import { ScrollView, TouchableOpacity } from "react-native";
import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { AddIcon } from "../ui/icon";
import ReminderSummaryBox from "./ReminderSummaryBox";
import { Heading } from "../ui/heading";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { formatScheduleString } from "@/lib/utils/format";
import { useState } from "react";
import { InsertSchedule } from "@/lib/schedules/schedules.types";
import AddEditScheduleActionsheet from "../schedule/AddEditScheduleActionsheet";
import { InsertReminderModel } from "@/lib/reminders/reminders.types";
import Fade from "../Fade";
import { Box } from "../ui/box";

const EXAMPLE_SCHEDULES: InsertSchedule[] = [
  {
    label: "Work",
    is_sunday: false,
    is_monday: true,
    is_tuesday: true,
    is_wednesday: true,
    is_thursday: true,
    is_friday: true,
    is_saturday: false,
    is_active: true,
    start_time: "08:00",
    end_time: "17:00",
  },
  {
    label: "Evening Routine",
    is_sunday: true,
    is_monday: true,
    is_tuesday: true,
    is_wednesday: true,
    is_thursday: true,
    is_friday: true,
    is_saturday: true,
    is_active: true,
    start_time: "18:00",
    end_time: "21:00",
  },
  {
    label: "Weekend Recharge",
    is_sunday: true,
    is_monday: false,
    is_tuesday: false,
    is_wednesday: false,
    is_thursday: false,
    is_friday: false,
    is_saturday: true,
    is_active: true,
    start_time: "10:00",
    end_time: "16:00",
  },
  {
    label: "Early Morning Focus",
    is_sunday: false,
    is_monday: true,
    is_tuesday: true,
    is_wednesday: true,
    is_thursday: true,
    is_friday: true,
    is_saturday: false,
    is_active: true,
    start_time: "05:30",
    end_time: "08:00",
  },
  {
    label: "Afternoon Deep Work",
    is_sunday: false,
    is_monday: true,
    is_tuesday: false,
    is_wednesday: true,
    is_thursday: false,
    is_friday: true,
    is_saturday: false,
    is_active: true,
    start_time: "13:00",
    end_time: "16:00",
  },
  {
    label: "Creative Block",
    is_sunday: false,
    is_monday: false,
    is_tuesday: true,
    is_wednesday: false,
    is_thursday: true,
    is_friday: false,
    is_saturday: false,
    is_active: true,
    start_time: "19:00",
    end_time: "22:00",
  },
  {
    label: "Sunday Reset",
    is_sunday: true,
    is_monday: false,
    is_tuesday: false,
    is_wednesday: false,
    is_thursday: false,
    is_friday: false,
    is_saturday: false,
    is_active: true,
    start_time: "15:00",
    end_time: "18:00",
  },
  {
    label: "Saturday Adventure",
    is_sunday: false,
    is_monday: false,
    is_tuesday: false,
    is_wednesday: false,
    is_thursday: false,
    is_friday: false,
    is_saturday: true,
    is_active: true,
    start_time: "08:00",
    end_time: "14:00",
  },
  {
    label: "Evening Exercise",
    is_sunday: false,
    is_monday: true,
    is_tuesday: false,
    is_wednesday: true,
    is_thursday: false,
    is_friday: true,
    is_saturday: false,
    is_active: true,
    start_time: "17:00",
    end_time: "19:00",
  },
  {
    label: "Wind Down",
    is_sunday: true,
    is_monday: true,
    is_tuesday: true,
    is_wednesday: true,
    is_thursday: true,
    is_friday: true,
    is_saturday: true,
    is_active: true,
    start_time: "21:00",
    end_time: "23:30",
  },
] as const;

type Props = {
  onNext: (reminder: Partial<InsertReminderModel>) => void;
  reminder: Partial<InsertReminderModel>;
};

export default function Schedules4({ onNext, reminder }: Props) {
  const [newScheduleOpen, setNewScheduleOpen] = useState(false);

  return (
    <VStack className="justify-between flex-1">
      <ReminderSummaryBox reminder={reminder} />
      <Heading size="2xl" className="mt-3">When do you want to be reminded?</Heading>
      <Heading size="xl" className="font-quicksand-bold my-3">
        Choose an optimized schedule 👌
      </Heading>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack>
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
        <Button
          size="xl"
          variant="outline"
          onPress={() => setNewScheduleOpen(true)}
        >
          <ButtonIcon as={AddIcon} />
          <ButtonText>Create My Own</ButtonText>
        </Button>
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
