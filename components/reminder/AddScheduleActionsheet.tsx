import { useState } from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetScrollView,
} from "../ui/actionsheet";
import { Button, ButtonText } from "../ui/button";
import { Checkbox, CheckboxGroup, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "../ui/checkbox";
import { Heading } from "../ui/heading";
import { Input, InputField } from "../ui/input";
import { CheckIcon } from "@/components/ui/icon"
import { DAYS } from "@/constants/utils";
import { VStack } from "../ui/vstack";
import DatePicker from "react-native-date-picker";
import dayjs from 'dayjs';
import { Box } from "../ui/box";
import { ScrollView } from "react-native";
import { createSchedule } from "@/lib/db-service";
import useWatch from "@/hooks/useWatch";

type AddScheduleActionsheetProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddScheduleActionsheet({
  isOpen,
  setIsOpen,
}: AddScheduleActionsheetProps) {
  const [days, setDays] = useState([
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ]);
  const [startTime, setStartTime] = useState(dayjs('2000-01-01 00:00').toDate());
  const [endTime, setEndTime] = useState(dayjs("2000-01-02 00:00").toDate());
  const [label, setLabel] = useState("");

  useWatch(isOpen, (val) => {
    if (val) {
        setLabel('');
        setStartTime(dayjs("2000-01-01 00:00").toDate());
        setEndTime(dayjs("2000-01-02 00:00").toDate());
        setDays([
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ]);
    }
  });

  const handleSave = async () => {
    const schedule = {
      label,
      isSunday: days.includes('sunday'),
      isMonday: days.includes('monday'),
      isTuesday: days.includes('tuesday'),
      isWednesday: days.includes('wednesday'),
      isThursday: days.includes('thursday'),
      isFriday: days.includes('friday'),
      isSaturday: days.includes('saturday'),
      startTime: dayjs(startTime).format("HH:mm"),
      endTime: dayjs(endTime).format("HH:mm"),
    };

    console.log("Saving schedule to database:", schedule);

    try {
      await createSchedule(
        label,
        schedule.isSunday,
        schedule.isMonday,
        schedule.isTuesday,
        schedule.isWednesday,
        schedule.isThursday,
        schedule.isFriday,
        schedule.isSaturday,
        schedule.startTime,
        schedule.endTime
      );
      console.log("Schedule saved successfully.");
    } catch (error) {
      console.error("Error saving schedule:", error);
    }

    // Close the actionsheet after saving
    setIsOpen(false);
  };

  return (
    <Actionsheet snapPoints={[90]} isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="items-start">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Heading size="xl" className="mb-2">
          New Schedule
        </Heading>
        <ActionsheetScrollView>
          <Input size="xl">
            <InputField
              placeholder="Label"
              value={label}
              onChangeText={(text) => setLabel(text)}
            />
          </Input>
          <CheckboxGroup
            value={days}
            onChange={(keys) => {
              setDays(keys);
            }}
            className="flex flex-row justify-between w-full p-4"
          >
            {DAYS.map((d) => (
              <Checkbox
                key={d.value}
                value={d.value}
                className="flex-col"
                size="xl"
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel>{d.label}</CheckboxLabel>
              </Checkbox>
            ))}
          </CheckboxGroup>
          <Heading>Between</Heading>
          <VStack space="xs" className="w-full">
            <Input size="xl" isReadOnly>
              <InputField
                placeholder="Start Time"
                value={dayjs(startTime).format("h:mm a")}
              />
            </Input>
            <Box className="flex w-full items-center">
              <DatePicker
                mode="time"
                date={startTime}
                onDateChange={setStartTime}
              />
            </Box>
            <Heading size="md">And</Heading>
            <Input size="xl" isReadOnly>
              <InputField
                placeholder="End Time"
                value={dayjs(endTime).format("h:mm a")}
              />
            </Input>
            <Box className="flex w-full items-center">
              <DatePicker
                mode="time"
                date={endTime}
                onDateChange={setEndTime}
              />
            </Box>
          </VStack>
        </ActionsheetScrollView>
        <Button className="w-full mt-4" size="xl" onPress={handleSave}>
          <ButtonText>Create Schedule</ButtonText>
        </Button>
      </ActionsheetContent>
    </Actionsheet>
  );
}
