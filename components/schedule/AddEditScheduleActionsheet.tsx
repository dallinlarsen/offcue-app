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
import { CheckIcon, RepeatIcon } from "@/components/ui/icon";
import { DAYS } from "@/constants/utils";
import { VStack } from "../ui/vstack";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import { Box } from "../ui/box";
import useWatch from "@/hooks/useWatch";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import {
  createSchedule,
  getSchedule,
  updateSchedule,
} from "@/lib/schedules/schedules.service";
import { Schedule } from "@/lib/schedules/schedules.types";
import { Alert, AlertIcon, AlertText } from "../ui/alert";

type AddScheduleActionsheetProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  schedule?: Schedule;
  onSave?: (schedule: Schedule) => void;
  onClose?: () => void;
};

const ZodSchema = z.object({
  label: z.string().min(1, "Required"),
  days: z.array(z.any()).min(1, "At least one day must be selected"),
  startTime: z.date(),
  endTime: z.date(),
});

export default function ({
  schedule,
  isOpen,
  setIsOpen,
  onSave,
  onClose,
}: AddScheduleActionsheetProps) {
  function getInitialFormState() {
    return {
      days: schedule
        ? [
            schedule.is_sunday && "sunday",
            schedule.is_monday && "monday",
            schedule.is_tuesday && "tuesday",
            schedule.is_wednesday && "wednesday",
            schedule.is_thursday && "thursday",
            schedule.is_friday && "friday",
            schedule.is_saturday && "saturday",
          ].filter((d) => !!d)
        : [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
      startTime: schedule
        ? dayjs(`2000-01-01 ${schedule.start_time}`).toDate()
        : dayjs("2000-01-01 00:00").toDate(),
      endTime: schedule
        ? dayjs(`2000-01-02 ${schedule.end_time}`).toDate()
        : dayjs("2000-01-02 00:00").toDate(),
      label: schedule ? schedule.label : "",
    };
  }

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: getInitialFormState(),
  });

  const [days, startTime, endTime] = watch(["days", "startTime", "endTime"]);

  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(
    null
  );

  useWatch(isOpen, (val) => {
    if (val) {
      const initialFormState = getInitialFormState();

      setValue("label", initialFormState.label);
      setValue("days", initialFormState.days);
      setValue("startTime", initialFormState.startTime);
      setValue("endTime", initialFormState.endTime);

      setShowDatePicker(null);
    }
  });

  useWatch(days, () => {
    clearErrors("days");
  });

  const onSubmit = handleSubmit(async (model) => {
    const scheduleModel = {
      label: model.label,
      is_sunday: model.days.includes("sunday"),
      is_monday: model.days.includes("monday"),
      is_tuesday: model.days.includes("tuesday"),
      is_wednesday: model.days.includes("wednesday"),
      is_thursday: model.days.includes("thursday"),
      is_friday: model.days.includes("friday"),
      is_saturday: model.days.includes("saturday"),
      start_time: dayjs(model.startTime).format("HH:mm"),
      end_time: dayjs(model.endTime).format("HH:mm"),
    };

    console.log("Saving schedule to database:", scheduleModel);

    let scheduleId = schedule?.id;

    try {
      if (schedule?.id) {
        await updateSchedule(schedule.id, scheduleModel);
      } else {
        scheduleId = await createSchedule(scheduleModel);
      }
      console.log("Schedule saved successfully.");
    } catch (error) {
      console.error("Error saving schedule:", error);
    }

    // Close the actionsheet after saving
    setIsOpen(false);

    if (scheduleId) {
      const newSchedule = await getSchedule(scheduleId);
      newSchedule && onSave && onSave(newSchedule);
    }
  });

  function onCloseHandler() {
    setIsOpen(false);
    onClose && onClose();
  }

  return (
    <Actionsheet snapPoints={[80]} isOpen={isOpen} onClose={onCloseHandler}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="items-start">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Heading size="xl" className="mb-2">
          {schedule ? "Edit" : "New"} Schedule
        </Heading>
        <ActionsheetScrollView>
          {schedule && (
            <Alert className="mb-2 bg-orange-100 dark:bg-orange-950 items-start">
              <AlertIcon
                as={RepeatIcon}
                className="text-orange-800 dark:text-orange-100 mr-1"
              />
              <AlertText
                size="lg"
                className="text-orange-800 dark:text-orange-100"
              >
                Editing will recreate all reminder times for current reminders
                on this schedule.
              </AlertText>
            </Alert>
          )}
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
          <ButtonText>{schedule ? "Update" : "Create"} Schedule</ButtonText>
        </Button>
      </ActionsheetContent>
    </Actionsheet>
  );
}
