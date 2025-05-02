import { ScrollView } from "react-native";
import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { ChevronDownIcon, ChevronRightIcon } from "../ui/icon";
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
import { FREQUENCY_TYPES } from "@/constants";
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

type Props = {
  onNext: (reminder: Partial<InsertReminderModel>) => void;
  reminder: Partial<InsertReminderModel>;
};

const ZodSchema = z.object({
  interval_type: z.string().nullish(),
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
});

export default function Frequency3({ onNext, reminder }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ZodSchema),
  });

  const nextPressedHandler = handleSubmit(async (model) => {
    onNext({
      interval_type: model.interval_type as IntervalType,
      interval_num: parseInt(model.interval_num),
      times: parseInt(model.times),
    });
  });

  return (
    <VStack space="lg" className="justify-between flex-1">
      <ReminderSummaryBox reminder={reminder} />
      <Heading size="2xl">How often do you want to be reminded?</Heading>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Heading size="xl" className="font-quicksand-bold mb-4">
          Now for the random part! 🎲
        </Heading>
        <VStack space="md">
          <VStack>
            <Heading size="xl">Remind Me</Heading>
            <HStack space="md">
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
              <Text size="xl" className="flex-1 mt-3">
                Time(s)
              </Text>
            </HStack>
          </VStack>

          <VStack>
            <Heading size="xl">Every</Heading>
            <HStack space="md">
              <FormControl isInvalid={!!errors.interval_num} className="flex-1">
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
        <Text size="2xl" className="leading-normal mt-6">
          Unlike other apps, offcue lets you set reminders to{" "}
          <Heading size="xl" className="font-quicksand-bold">
            pop up at random times
          </Heading>{" "}
          within a schedule you choose. That means no more stressing about the
          perfect time, just set it and let the{" "}
          <Heading size="xl" className="font-quicksand-bold">
            magic happen! 🪄
          </Heading>{" "}
        </Text>
      </ScrollView>
      <Button size="xl" onPress={nextPressedHandler}>
        <ButtonText>Next</ButtonText>
        <ButtonIcon as={ChevronRightIcon} />
      </Button>
    </VStack>
  );
}
