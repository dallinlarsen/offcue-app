import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "../ui/icon";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
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
import { Controller, useForm } from "react-hook-form";
import { Input, InputField } from "../ui/input";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import {
  InsertReminderModel,
  IntervalType,
} from "@/lib/reminders/reminders.types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ReminderSummaryBox from "./ReminderSummaryBox";
import { HStack } from "../ui/hstack";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FREQUENCY_TYPES } from "@/lib/schedules/schedules.constants";
import useWatch from "@/hooks/useWatch";

type Props = {
  onNext: (reminder: Partial<InsertReminderModel>) => void;
  onPrevious: (reminder: Partial<InsertReminderModel>) => void;
  reminder: Partial<InsertReminderModel>;
};

const ZodSchema = z
  .object({
    interval_type: z.string().min(1, "Required"),
    interval_num: z
      .string()
      .min(1, "Required")
      .refine((num) => !num || parseInt(num) < 100, "Must be less than 100")
      .refine((num) => !num || parseInt(num) > 0, "Must be greater than 0"),
    times: z
      .string()
      .min(1, "Required")
      .refine((num) => parseInt(num) < 50, "Must be less than 50")
      .refine((num) => parseInt(num) > 0, "Must be greater than 0"),
  })
  .refine(
    ({ times, interval_type, interval_num }) => {
      if (
        !times ||
        !interval_type ||
        !interval_num ||
        (interval_type !== "minute" && interval_type !== "hour")
      )
        return true;

      const minutesMap: Record<"minute" | "hour", number> = {
        minute: 1,
        hour: 60,
      };

      const maxTimes = parseInt(interval_num) * minutesMap[interval_type];
      return parseInt(times) < maxTimes;
    },
    {
      message: "Must be less than total minutes in interval",
      path: ["times"],
    }
  );

export default function Frequency3({ onNext, onPrevious, reminder }: Props) {
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid, isSubmitted },
  } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      times: reminder.times?.toString(),
      interval_num: reminder.interval_num?.toString(),
      interval_type: reminder.interval_type,
    },
  });

  const nextPressedHandler = handleSubmit(async (model) => {
    onNext({
      interval_type: model.interval_type as IntervalType,
      interval_num: parseInt(model.interval_num),
      times: parseInt(model.times),
    });
  });

  function previousPressedHandler() {
    onPrevious(reminder);
  }

  const [interval_num_val, interval_type_val] = watch([
    "interval_num",
    "interval_type",
  ]);

  useWatch(interval_num_val, () => {
    trigger("times");
  });

  useWatch(interval_type_val, () => {
    trigger("times");
  });

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
      extraScrollHeight={20}
      extraHeight={20}
    >
      <VStack space="lg" className="justify-between flex-1">
        <VStack space="md">
          <ReminderSummaryBox reminder={reminder} />
          <Heading size="2xl">How often do you want to be reminded?</Heading>
          <Text size="2xl" className="leading-normal">
            Unlike other apps, Offcue lets you set reminders to{" "}
            <Heading size="xl" className="font-quicksand-bold">
              pop up at random times 🎲
            </Heading>{" "}
            on an interval.
          </Text>
          <Text size="2xl" className="leading-normal">
            For example, you may want to be reminded to drink a glass of water 2
            times every 6 hours, or to call your mom once every month, but you{" "}
            <Heading size="xl" className="font-quicksand-bold">
              don't really care when
            </Heading>{" "}
            just as long as you do it.
          </Text>
          <VStack space="md">
            <VStack>
              <Heading size="xl">Remind Me</Heading>
              <FormControl isInvalid={!!errors.times} className="flex-1">
                <HStack space="md">
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
                  <Text size="xl" className="flex-1 mt-3">
                    Time(s)
                  </Text>
                </HStack>
                <FormControlError>
                  <FormControlErrorText>
                    {errors?.times?.message || ""}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            </VStack>

            <VStack>
              <Heading size="xl">Every</Heading>
              <HStack space="md">
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
              </HStack>
            </VStack>
          </VStack>
        </VStack>
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
            className="flex-1"
            size="xl"
            onPress={nextPressedHandler}
            isDisabled={!isValid && isSubmitted}
          >
            <ButtonText>Next</ButtonText>
            <ButtonIcon as={ChevronRightIcon} />
          </Button>
        </HStack>
      </VStack>
    </KeyboardAwareScrollView>
  );
}
