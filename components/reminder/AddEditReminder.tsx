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
import { FREQUENCY_TYPES } from "@/constants";
import { HStack } from "../ui/hstack";
import { Card } from "../ui/card";
import { formatScheduleString } from "@/lib/utils/format";
import {
  AddIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  Icon,
  PushPinIcon,
  RepeatIcon,
} from "../ui/icon";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import colors from "tailwindcss/colors";
import { ScheduleActionsheet } from "@/components/schedule/ScheduleActionsheet";
import { useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import DatePicker from "react-native-date-picker";
import useWatch from "@/hooks/useWatch";
import Fade from "../Fade";
import { InsertReminder, IntervalType } from "@/lib/reminders/reminders.types";
import { Schedule } from "@/lib/schedules/schedules.types";
import {
  createReminder,
  updateReminder,
} from "@/lib/reminders/reminders.service";
import AddEditScheduleActionsheet from "../schedule/AddEditScheduleActionsheet";

dayjs.extend(isSameOrBefore);

type AddEditReminderProps = {
  data: InsertReminder & { schedules: Schedule[]; id?: number };
  onSave: (reminderId: number) => void;
  onCancel?: () => void;
  setArchiveDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

const ZodSchema = z
  .object({
    title: z.string().min(1, "Required"),
    description: z.string().nullish(),
    interval_type: z.string().nullish(),
    interval_num: z
      .string()
      .nullish()
      .refine((num) => !num || parseInt(num) < 100, "Must be less than 100")
      .refine((num) => !num || parseInt(num) > 0, "Must be greater than 0"),
    times: z
      .string()
      .min(1, "Required")
      .refine((num) => parseInt(num) < 50, "Must be less than 50")
      .refine((num) => parseInt(num) > 0, "Must be greater than 0"),
    track_streak: z.boolean(),
    schedules: z
      .array(z.any())
      .min(1, "At least one schedule is required")
      .max(3, "A maximum of 3 schedules can be selected"),
    start_date: z.date().nullish(),
    end_date: z.date().nullish(),
    recurring: z.boolean(),
  })
  .refine(
    ({ recurring, interval_num }) => (recurring ? !!interval_num : true),
    {
      message: "Required",
      path: ["interval_num"],
    }
  )
  .refine(
    ({ recurring, interval_type }) => (recurring ? !!interval_type : true),
    {
      message: "Required",
      path: ["interval_type"],
    }
  )
  .refine(
    ({ start_date, end_date }) => {
      if (start_date && end_date) {
        return dayjs(start_date).isSameOrBefore(dayjs(end_date));
      }
      return true;
    },
    {
      message: "End date must be the same or after start date",
      path: ["start_date"],
    }
  );

export default function AddEditReminder({
  data,
  onSave,
  onCancel,
  setArchiveDialogOpen,
}: AddEditReminderProps) {
  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors, isValid, isSubmitted },
  } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      ...data,
      interval_num: data.interval_num.toString(),
      times: data.times.toString(),
      recurring: data.is_recurring,
      start_date: data.start_date ? dayjs(data.start_date).toDate() : undefined,
      end_date: data.end_date ? dayjs(data.end_date).toDate() : undefined,
    },
  });

  const onSubmit = handleSubmit(async (model) => {
    let interval_type = model.interval_type;
    let interval_num = model.interval_num;

    if (!model.recurring) {
      interval_type = "day";
      interval_num = "1";
    }

    try {
      let reminderId = data.id;
      if (data.id) {
        await updateReminder({
          id: data.id,
          title: model.title,
          description: model.description || undefined,
          interval_type: (interval_type as IntervalType) || "day",
          interval_num: parseInt(interval_num!),
          times: parseInt(model.times),
          scheduleIds: model.schedules.map((s) => s.id),
          track_streak: model.track_streak,
          start_date: model.start_date
            ? dayjs(model.start_date).format("YYYY-MM-DD")
            : undefined,
          end_date: model.end_date
            ? dayjs(model.end_date).format("YYYY-MM-DD")
            : undefined,
        });
      } else {
        reminderId = await createReminder({
          title: model.title,
          description: model.description || undefined,
          interval_type: (interval_type as IntervalType) || "day",
          interval_num: parseInt(interval_num!),
          times: parseInt(model.times),
          scheduleIds: model.schedules.map((s) => s.id),
          track_streak: model.track_streak,
          track_notes: false,
          is_recurring: model.recurring,
          start_date: model.start_date
            ? dayjs(model.start_date).format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD"),
          end_date: model.end_date
            ? dayjs(model.end_date).format("YYYY-MM-DD")
            : null,
        });
      }
      onSave(reminderId!);
    } catch (error) {
      console.error("Error saving reminder:", error);
      alert("Error saving reminder. Please try again.");
    }
  });

  const [schedules, track_streak, recurring, start_date, end_date] = watch([
    "schedules",
    "track_streak",
    "recurring",
    "start_date",
    "end_date",
  ]);
  const [schedulesOpen, setSchedulesOpen] = useState(false);
  const [addScheduleOpen, setAddScheduleOpen] = useState(false);
  const [reopenSchedules, setReopenSchedules] = useState(false);
  const [additionalOptionsOpen, setAdditionalOptionsOpen] = useState(
    !!start_date
  );
  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(
    null
  );

  function addScheduleOnCloseHandler() {
    if (reopenSchedules) {
      setSchedulesOpen(true);
      setReopenSchedules(false);
    }
  }

  useWatch(addScheduleOpen, (value) => {
    if (value) {
      setSchedulesOpen(false);
      setReopenSchedules(true);
    }
  });

  useWatch(start_date, () => {
    clearErrors();
  });

  useWatch(end_date, () => {
    clearErrors();
  });

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="xl" className="mb-16">
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
          {!data.id && (
            <HStack className="rounded border border-background-900">
              <Button
                size="xl"
                className="flex-1 rounded-none border-0"
                variant={recurring ? "solid" : "outline"}
                onPress={() => setValue("recurring", true)}
              >
                <ButtonIcon as={RepeatIcon} />
                <ButtonText>Habit</ButtonText>
              </Button>
              <Button
                size="xl"
                className="flex-1 rounded-none border-0"
                variant={recurring ? "outline" : "solid"}
                onPress={() => setValue("recurring", false)}
              >
                {/* <MaterialIcons name="push-pin" size={20} color='black' /> */}
                <ButtonIcon
                  as={PushPinIcon}
                  size="2xl"
                  className={
                    recurring ? "fill-typography-600" : "fill-typography-0"
                  }
                />
                <ButtonText>Task</ButtonText>
              </Button>
            </HStack>
          )}
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
                Time(s) {!recurring && "per day"}
              </Text>
            </Box>
          </Box>
          {recurring && (
            <VStack>
              <Heading size="xl">Every</Heading>
              <Box className="flex flex-row gap-2">
                <FormControl
                  isInvalid={!!errors.interval_num}
                  className="flex-1"
                >
                  <Controller
                    control={control}
                    name="interval_num"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input size="xl">
                        <InputField
                          placeholder="Frequency"
                          value={value || ""}
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
          )}
          <VStack>
            <Heading size="xl">When</Heading>
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
                action={errors.schedules ? "negative" : undefined}
                onPress={() => setSchedulesOpen(true)}
              >
                <ButtonIcon as={AddIcon} />
                <ButtonText>Schedule</ButtonText>
              </Button>
            )}
            {errors.schedules && (
              <Text className="text-red-700 dark:text-red-500">
                {errors.schedules?.message}
              </Text>
            )}
          </VStack>
          <TouchableOpacity
            onPress={() => setAdditionalOptionsOpen(!additionalOptionsOpen)}
          >
            <HStack space="sm" className="pt-4 px-1 items-center">
              <Heading size="xl">Additional Options</Heading>
              {
                <Icon
                  size="lg"
                  as={
                    additionalOptionsOpen ? ChevronDownIcon : ChevronRightIcon
                  }
                />
              }
            </HStack>
          </TouchableOpacity>
          {additionalOptionsOpen && (
            <>
              {recurring && (
                <>
                  <HStack space="xl" className="items-center">
                    <Text size="xl" className="font-quicksand-semibold">
                      Track Streak
                    </Text>
                    <Switch
                      value={track_streak}
                      onValueChange={(track) => setValue("track_streak", track)}
                      trackColor={{
                        false: colors.gray[300],
                        true: colors.gray[500],
                      }}
                      thumbColor={colors.gray[50]}
                      ios_backgroundColor={colors.gray[300]}
                    />
                  </HStack>
                </>
              )}
              <Heading size="lg" className="-mb-4">
                Start Date
              </Heading>
              <Input
                size="xl"
                isReadOnly
                onTouchEnd={() =>
                  setShowDatePicker(showDatePicker === "start" ? null : "start")
                }
              >
                <InputField
                  placeholder="Start Date"
                  value={
                    dayjs(start_date).format("YYYY-MM-DD") ===
                    dayjs().format("YYYY-MM-DD")
                      ? "Today"
                      : dayjs(start_date).format("MMMM D, YYYY")
                  }
                />
              </Input>

              <DatePicker
                modal
                open={showDatePicker === "start"}
                mode="date"
                title="Start Date"
                minimumDate={dayjs().utc().toDate()}
                date={start_date || dayjs().utc().toDate()}
                onConfirm={(value) => setValue("start_date", value)}
                onCancel={() => setShowDatePicker(null)}
              />
              {recurring && (
                <>
                  <FormControl isInvalid={!!errors.start_date}>
                    <HStack>
                      <Input
                        size="xl"
                        className="flex-1"
                        isReadOnly
                        onTouchEnd={() =>
                          setShowDatePicker(
                            showDatePicker === "end" ? null : "end"
                          )
                        }
                      >
                        <InputField
                          value={
                            end_date
                              ? dayjs(end_date).format("MMMM D, YYYY")
                              : "No End Date"
                          }
                        />
                      </Input>
                      {end_date && (
                        <Button
                          size="2xl"
                          className="px-6"
                          variant="link"
                          onPress={() => setValue("end_date", null)}
                        >
                          <ButtonIcon as={CloseIcon} />
                        </Button>
                      )}
                    </HStack>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors?.start_date?.message || ""}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                  <DatePicker
                    modal
                    open={showDatePicker === "end"}
                    mode="date"
                    minimumDate={start_date || dayjs().utc().toDate()}
                    title="End Date"
                    date={dayjs().utc().toDate()}
                    onConfirm={(value) => setValue("end_date", value)}
                    onCancel={() => setShowDatePicker(null)}
                  />
                </>
              )}
            </>
          )}
          {setArchiveDialogOpen && recurring && (
            <Button
              size="xl"
              variant="outline"
              className="border-orange-700 dark:border-orange-400"
              onPress={() => setArchiveDialogOpen(true)}
            >
              <ButtonText className="text-orange-700 dark:text-orange-400">
                Archive
              </ButtonText>
            </Button>
          )}
        </VStack>
      </ScrollView>
      <Fade />
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
        <Button size="xl" onPress={onSubmit} className="flex-1" isDisabled={!isValid && isSubmitted}>
          <ButtonText>{data.id ? "Update" : "Save"}</ButtonText>
        </Button>
      </HStack>
      <ScheduleActionsheet
        isOpen={schedulesOpen}
        setIsOpen={setSchedulesOpen}
        setAddScheduleOpen={setAddScheduleOpen}
        addSchedule={(schedule) => {
          setValue("schedules", [...schedules, schedule]);
          clearErrors("schedules");
        }}
        filterIds={schedules.map((s) => s.id)}
      />
      <AddEditScheduleActionsheet
        isOpen={addScheduleOpen}
        setIsOpen={setAddScheduleOpen}
        onClose={addScheduleOnCloseHandler}
        onSave={(schedule) => {
          setValue("schedules", [...schedules, schedule]);
          clearErrors("schedules");
        }}
      />
    </>
  );
}
