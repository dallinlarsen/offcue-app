import { ScrollView } from "react-native";
import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { ChevronRightIcon } from "../ui/icon";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { Switch } from "../ui/switch";
import colors from "tailwindcss/colors";
import { Heading } from "../ui/heading";
import { Input, InputField } from "../ui/input";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertReminderModel } from "@/lib/reminders/reminders.types";
import { useState } from "react";
import ReminderSummaryBox from "./ReminderSummaryBox";

type Props = {
  onNext: (reminder: Partial<InsertReminderModel>) => void;
  reminder: Partial<InsertReminderModel>;
};

const ZodSchema = z
  .object({
    track_streak: z.boolean(),
    start_date: z.date().nullish(),
    end_date: z.date().nullish(),
  })
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

export default function AdvancedSettings5({ onNext, reminder }: Props) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      track_streak: false,
    },
  });

  const [track_streak, start_date, end_date] = watch([
    "track_streak",
    "start_date",
    "end_date",
  ]);

  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(
    null
  );

  const [showEndDateOption, setShowEndDateOption] = useState(!!end_date);

  const nextPressedHandler = handleSubmit(async (model) => {
    onNext({
      track_streak: model.track_streak,
      start_date: dayjs(model.start_date).format("YYYY-MM-DD"),
      end_date: showEndDateOption
        ? dayjs(model.end_date).format("YYYY-MM-DD")
        : undefined,
    });
  });

  return (
    <VStack space="lg" className="justify-between flex-1">
      <ReminderSummaryBox reminder={reminder} />
      <Heading size="2xl">Other Advanced Options</Heading>
      <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
        <VStack space="lg">
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

          <VStack>
            <Heading size="lg">Start Date</Heading>
            <Input
              size="xl"
              isReadOnly
              onTouchEnd={() =>
                setShowDatePicker(showDatePicker === "start" ? null : "start")
              }
            >
              <InputField
                placeholder="Start Date"
                value={dayjs(start_date).format("MMMM D, YYYY")}
              />
            </Input>
          </VStack>

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

          <VStack>
            <HStack space="xl" className="items-center mb-1">
              <Text size="xl" className="font-quicksand-semibold">
                Set End Date
              </Text>
              <Switch
                value={showEndDateOption}
                onValueChange={(show) => setShowEndDateOption(show)}
                trackColor={{
                  false: colors.gray[300],
                  true: colors.gray[500],
                }}
                thumbColor={colors.gray[50]}
                ios_backgroundColor={colors.gray[300]}
              />
            </HStack>
            {showEndDateOption && (
              <>
                <FormControl isInvalid={!!errors.start_date}>
                  <Input
                    size="xl"
                    isReadOnly
                    onTouchEnd={() =>
                      setShowDatePicker(showDatePicker === "end" ? null : "end")
                    }
                  >
                    <InputField
                      value={
                        end_date
                          ? dayjs(end_date).format("MMMM D, YYYY")
                          : dayjs(start_date).format("MMMM D, YYYY")
                      }
                    />
                  </Input>
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
          </VStack>
        </VStack>
        <Text size="2xl" className="leading-normal mt-6">
          Track your streak 🔥, customize when you want the reminder to begin or end. Its your reminder so make it yours! 🫵
          
        </Text>
      </ScrollView>
      <Button size="xl" onPress={nextPressedHandler}>
        <ButtonText>Next</ButtonText>
        <ButtonIcon as={ChevronRightIcon} />
      </Button>
    </VStack>
  );
}
