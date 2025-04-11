import { ScrollView, Switch, TouchableOpacity } from "react-native";
import { VStack } from "../ui/vstack";
import { Input, InputField } from "../ui/input";
import { Textarea, TextareaInput } from "../ui/textarea";
import { Heading } from "../ui/heading";
import { Box } from "../ui/box";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "../ui/select";
import { Text } from "@/components/ui/text";
import { FREQUENCY_TYPES } from "@/constants/utils";
import { HStack } from "../ui/hstack";
import { Card } from "../ui/card";
import { formatScheduleString } from "@/lib/utils";
import { AddIcon, ChevronDownIcon, CloseIcon, Icon } from "../ui/icon";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import colors from "tailwindcss/colors";
import { ScheduleActionsheet } from "./ScheduleActionsheet";
import { IntervalType, Reminder } from "@/lib/types";
import { useState } from "react";
import { createReminder, updateReminder } from "@/lib/db-service";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";

type AddEditReminderProps = {
  data: Reminder;
  onSave: () => void;
  onCancel?: () => void;
};

const ZodSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().nullish(),
  interval_type: z.string().min(1, "Required"),
  interval_num: z
    .string()
    .min(1, "Required")
    .refine((num) => parseInt(num) < 60, "Must be less than 60")
    .refine((num) => parseInt(num) > 0, "Must be greater than 0"),
  times: z
    .string()
    .min(1, "Required")
    .refine((num) => parseInt(num) < 20, "Must be less than 20")
    .refine((num) => parseInt(num) > 0, "Must be greater than 0"),
  track_streak: z.boolean(),
  schedules: z
    .array(z.any())
    .min(1, "At least one schedule is required")
    .max(3, "A maximum of 3 schedules can be selected"),
});

export default function AddEditReminder({
  data,
  onSave,
  onCancel,
}: AddEditReminderProps) {
  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      ...data,
      interval_num: data.interval_num.toString(),
      times: data.times.toString(),
    },
  });

  const onSubmit = handleSubmit(async (model) => {
    try {
      if (data.id) {
        await updateReminder(
          data.id,
          model.title,
          model.description || "",
          model.interval_type,
          parseInt(model.interval_num),
          parseInt(model.times),
          model.schedules.map((s) => s.id),
          model.track_streak,
          data.track_notes,
          data.is_muted
        );
      } else {
        await createReminder(
          model.title,
          model.description || "",
          model.interval_type,
          parseInt(model.interval_num),
          parseInt(model.times),
          model.schedules.map((s) => s.id),
          model.track_streak,
          false,
          false
        );
      }
      onSave();
    } catch (error) {
      console.error("Error saving reminder:", error);
      alert("Error saving reminder. Please try again.");
    }
  });

  const [schedules, track_streak] = watch(["schedules", "track_streak"]);
  const [schedulesOpen, setSchedulesOpen] = useState(false);

  return (
    <>
      <ScrollView>
        <VStack space="xl">
          <VStack space="sm">
            <FormControl isInvalid={!!errors.title}>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input size="xl">
                    <InputField
                      placeholder="Title"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors?.title?.message || ""}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Textarea size="xl">
                    <TextareaInput
                      placeholder="Description"
                      value={value as string | undefined}
                      onBlur={onBlur}
                      onChangeText={onChange}
                    />
                  </Textarea>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors?.description?.message || ""}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </VStack>
          <VStack>
            <Heading size="xl">Every</Heading>
            <Box className="flex flex-row gap-2">
              <FormControl isInvalid={!!errors.interval_num} className="flex-1">
                <Controller
                  control={control}
                  name="interval_num"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input size="xl">
                      <InputField
                        placeholder="Frequency"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                      />
                    </Input>
                  )}
                />
                <FormControlError>
                  <FormControlErrorText>
                    {errors?.interval_num?.message || ""}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
              <FormControl
                isInvalid={!!errors.interval_type}
                className="flex-1"
              >
                <Controller
                  control={control}
                  name="interval_type"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Select
                      selectedValue={value}
                      onValueChange={onChange}
                      initialLabel={
                        FREQUENCY_TYPES.find((t) => t.value === value)?.label
                      }
                    >
                      <SelectTrigger
                        variant="outline"
                        size="xl"
                        className="flex justify-between"
                      >
                        <SelectInput
                          placeholder="Select Option"
                          onBlur={onBlur}
                        />
                        <SelectIcon className="mr-3" as={ChevronDownIcon} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          {FREQUENCY_TYPES.map((t) => (
                            <SelectItem
                              key={t.value}
                              label={t.label}
                              value={t.value}
                            />
                          ))}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  )}
                />
                <FormControlError>
                  <FormControlErrorText>
                    {errors?.interval_type?.message || ""}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            </Box>
          </VStack>
          <Box>
            <Heading size="xl">Remind Me</Heading>
            <Box className="flex flex-row w-full gap-2 items-center">
              <FormControl isInvalid={!!errors.times} className="flex-1">
                <Controller
                  control={control}
                  name="times"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input size="xl" className="flex-1">
                      <InputField
                        placeholder="Times"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                      />
                    </Input>
                  )}
                />
                <FormControlError>
                  <FormControlErrorText>
                    {errors?.times?.message || ""}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
              <Text size="xl" className="flex-1">
                Time(s)
              </Text>
            </Box>
          </Box>
          <VStack>
            <Heading size="xl">But Only On</Heading>
            {schedules.length > 0 ? (
              <>
                <VStack space="sm">
                  {schedules.map((schedule) => (
                    <Card key={schedule.id} variant="filled">
                      <HStack className="justify-between items-center">
                        <HStack space="md" className="items-end">
                          <Text size="xl" className="font-semibold">
                            {schedule.label || "No Label"}
                          </Text>
                          <Text>{formatScheduleString(schedule)}</Text>
                        </HStack>
                        <TouchableOpacity
                          onPress={() =>
                            setValue(
                              "schedules",
                              schedules.filter((s) => s.id !== schedule.id)
                            )
                          }
                          className="p-3 -m-3"
                        >
                          <Icon as={CloseIcon} size="lg" />
                        </TouchableOpacity>
                      </HStack>
                    </Card>
                  ))}
                </VStack>
                <HStack className="justify-between">
                  <Box></Box>
                  <Button
                    variant="link"
                    size="xl"
                    onPress={() => setSchedulesOpen(true)}
                    isDisabled={schedules.length >= 3}
                  >
                    <ButtonIcon as={AddIcon} />
                    <ButtonText>Schedule</ButtonText>
                  </Button>
                </HStack>
              </>
            ) : (
              <Button
                size="xl"
                variant="outline"
                action={errors.schedules ? 'negative' : undefined}
                onPress={() => setSchedulesOpen(true)}
              >
                <ButtonIcon as={AddIcon} />
                <ButtonText>Schedule</ButtonText>
              </Button>
            )}
            {errors.schedules && (
              <Text className="text-red-700 dark:text-red-500">{errors.schedules?.message}</Text>
            )}
          </VStack>
          <HStack space="xl" className="items-center">
            <Text size="xl" className="font-quicksand-semibold">
              Track Streak
            </Text>
            <Switch
              value={track_streak}
              onValueChange={(track) => setValue("track_streak", track)}
              trackColor={{ false: colors.gray[300], true: colors.gray[500] }}
              thumbColor={colors.gray[50]}
              ios_backgroundColor={colors.gray[300]}
            />
          </HStack>
        </VStack>
      </ScrollView>
      <HStack space="md">
        {onCancel ? (
          <Button
            size="xl"
            onPress={() => onCancel()}
            className="flex-1"
            variant="outline"
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
        ) : null}
        <Button size="xl" onPress={onSubmit} className="flex-1">
          <ButtonText>{data.id ? "Update" : "Save"}</ButtonText>
        </Button>
      </HStack>
      <ScheduleActionsheet
        isOpen={schedulesOpen}
        setIsOpen={setSchedulesOpen}
        addSchedule={(schedule) => {
          setValue("schedules", [...schedules, schedule]);
          clearErrors("schedules");
        }}
        filterIds={schedules.map((s) => s.id)}
      />
    </>
  );
}
