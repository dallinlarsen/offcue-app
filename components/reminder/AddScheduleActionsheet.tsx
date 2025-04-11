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
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "../ui/checkbox";
import { Heading } from "../ui/heading";
import { Input, InputField } from "../ui/input";
import { CheckIcon } from "@/components/ui/icon";
import { DAYS } from "@/constants/utils";
import { VStack } from "../ui/vstack";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import { Box } from "../ui/box";
import { createSchedule } from "@/lib/db-service";
import useWatch from "@/hooks/useWatch";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";

type AddScheduleActionsheetProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ZodSchema = z.object({
  label: z.string().min(1, "Required"),
  days: z.array(z.any()).min(1, "At least one day must be selected"),
  startTime: z.date(),
  endTime: z.date(),
});

export function AddScheduleActionsheet({
  isOpen,
  setIsOpen,
}: AddScheduleActionsheetProps) {
  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      days: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
      startTime: dayjs("2000-01-01 00:00").toDate(),
      endTime: dayjs("2000-01-02 00:00").toDate(),
      label: "",
    },
  });

  const [days, startTime, endTime] = watch(["days", "startTime", "endTime"]);

  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(
    null
  );

  useWatch(isOpen, (val) => {
    if (val) {
      reset();
      setShowDatePicker(null);
    }
  });

  useWatch(days, () => {
    clearErrors('days');
  })

  const onSubmit = handleSubmit(async (model) => {
    const schedule = {
      label: model.label,
      isSunday: model.days.includes("sunday"),
      isMonday: model.days.includes("monday"),
      isTuesday: model.days.includes("tuesday"),
      isWednesday: model.days.includes("wednesday"),
      isThursday: model.days.includes("thursday"),
      isFriday: model.days.includes("friday"),
      isSaturday: model.days.includes("saturday"),
      startTime: dayjs(model.startTime).format("HH:mm"),
      endTime: dayjs(model.endTime).format("HH:mm"),
    };

    console.log("Saving schedule to database:", schedule);

    try {
      await createSchedule(
        schedule.label,
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
  });

  return (
    <Actionsheet
      snapPoints={[80]}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <ActionsheetBackdrop />
      <ActionsheetContent className="items-start">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Heading size="xl" className="mb-2">
          New Schedule
        </Heading>
        <ActionsheetScrollView>
          <FormControl isInvalid={!!errors.label} className="mb-4">
            <Controller
              control={control}
              name="label"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input size="xl">
                  <InputField
                    placeholder="Label"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorText>
                {errors?.label?.message || ""}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl isInvalid={!!errors.days} className="mb-4">
            <CheckboxGroup
              value={days}
              onChange={(days) => setValue("days", days)}
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
            <FormControlError className="-mt-2"> 
              <FormControlErrorText>
                {errors?.days?.message || ""}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <Heading>Between</Heading>
          <VStack space="xs" className="w-full">
            <Input
              size="xl"
              isReadOnly
              onTouchEnd={() =>
                setShowDatePicker(showDatePicker === "start" ? null : "start")
              }
            >
              <InputField
                placeholder="Start Time"
                value={dayjs(startTime).format("h:mm a")}
              />
            </Input>
            {showDatePicker === "start" ? (
              <Box className="flex w-full items-center">
                <DatePicker
                  mode="time"
                  date={startTime}
                  onDateChange={(value) => setValue("startTime", value)}
                />
              </Box>
            ) : null}
            <Heading size="md">And</Heading>
            <Input
              size="xl"
              isReadOnly
              onTouchEnd={() =>
                setShowDatePicker(showDatePicker === "end" ? null : "end")
              }
            >
              <InputField
                placeholder="End Time"
                value={dayjs(endTime).format("h:mm a")}
              />
            </Input>
            {showDatePicker === "end" ? (
              <Box className="flex w-full items-center">
                <DatePicker
                  mode="time"
                  date={endTime}
                  onDateChange={(value) => setValue("endTime", value)}
                />
              </Box>
            ) : null}
          </VStack>
        </ActionsheetScrollView>
        <Button className="w-full mt-4" size="xl" onPress={onSubmit}>
          <ButtonText>Create Schedule</ButtonText>
        </Button>
      </ActionsheetContent>
    </Actionsheet>
  );
}
