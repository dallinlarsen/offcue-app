import { TouchableOpacity } from "react-native";
import { Card } from "../ui/card";
import { VStack } from "../ui/vstack";
import { Heading } from "../ui/heading";
import { Text } from "@/components/ui/text";
import { formatFrequencyString, formatScheduleString } from "@/lib/utils";
import { Box } from "../ui/box";
import { HStack } from "../ui/hstack";
import colors from "tailwindcss/colors";
import { Switch } from "../ui/switch";
import { useRouter } from "expo-router";
import {
  updateNotificationResponse,
  updateNotificationResponseOneTime,
  updateReminderMuted,
} from "@/lib/db-service";
import { NotificationResponseStatus, Reminder } from "@/lib/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useWatch from "@/hooks/useWatch";
import { Button, ButtonText } from "../ui/button";
import { useConfetti } from "@/hooks/useConfetti";
import { Icon, PushPinIcon, RepeatIcon } from "../ui/icon";

type Props = {
  reminder: Reminder;
  onNotificationResponse: () => void;
  onMuted: () => void;
};

const ZodSchema = z.object({
  is_muted: z.boolean(),
});

export default function ({ reminder, onNotificationResponse, onMuted }: Props) {
  const router = useRouter();
  const confetti = useConfetti();

  const { watch, setValue } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      is_muted: reminder.is_muted,
    },
  });

  const is_muted = watch("is_muted");

  useWatch(is_muted, async (newVal) => {
    await updateReminderMuted(reminder.id!, newVal);
    onMuted();
  });

  useWatch(reminder, (r) => {
    setValue("is_muted", r.is_muted);
  });

  function sendConfetti() {
    confetti.current?.restart();
    setTimeout(() => confetti.current?.reset(), 9000);
  }

  async function handleNotificationAction(
    response: NotificationResponseStatus
  ) {
    if (reminder.is_recurring && !reminder.due_notification_id) return;
    if (reminder.is_recurring) {
      await updateNotificationResponse(reminder.due_notification_id!, response);
    } else {
      await updateNotificationResponseOneTime(reminder.id!, response);
    }

    if (response === "done") {
      sendConfetti();
    }
    onNotificationResponse();
  }

  return (
    <Card
      variant={reminder.due_scheduled_at ? "outline" : "filled"}
      className={`${
        reminder.due_scheduled_at ? "bg-background-50" : "bg-background-100"
      } p-3 flex-1 aspect-square justify-between rounded-2xl border-background-500`}
    >
      <TouchableOpacity
        onPress={() => router.push(`/reminder/${reminder.id}`)}
        className="flex-1"
      >
        <VStack>
          <HStack>
            <Heading
              numberOfLines={2}
              className={`font-quicksand-bold flex-1 ${
                is_muted ? "text-typography-500" : ""
              }`}
              size="lg"
            >
              {reminder.title}
            </Heading>
            {reminder.is_recurring ? (
              <Icon size="sm" as={RepeatIcon} />
            ) : (
              <Icon
                size="md"
                as={PushPinIcon}
                className="fill-typography-700"
              />
            )}
          </HStack>
          {!reminder.due_scheduled_at && (
            <>
              <Text
                numberOfLines={1}
                className={is_muted ? "text-typography-500" : ""}
              >
                {formatFrequencyString(
                  reminder.times,
                  reminder.interval_num,
                  reminder.interval_type
                )}
              </Text>
              <Text className={is_muted ? "text-typography-500" : ""}>
                when "{reminder.schedules[0].label}"
              </Text>
              {reminder.schedules.slice(1).length > 0 ? (
                <Text size="sm" className="-mt-1">
                  +{reminder.schedules.slice(1).length} More
                </Text>
              ) : null}
            </>
          )}
        </VStack>
      </TouchableOpacity>
      {reminder.due_scheduled_at ? (
        <VStack space="sm">
          <Button
            size="xl"
            variant="outline"
            onPress={() =>
              handleNotificationAction(reminder.is_recurring ? "skip" : "later")
            }
          >
            <ButtonText>
              {reminder.is_recurring ? "Skip" : "Do it Later"}
            </ButtonText>
          </Button>
          <Button size="xl" onPress={() => handleNotificationAction("done")}>
            <ButtonText>Done</ButtonText>
          </Button>
        </VStack>
      ) : reminder.is_recurring ? (
        <Box className="flex flex-row">
          <Box className="flex-grow" />
          <HStack space="sm" className="items-center">
            <Text size="lg" className="font-quicksand-semibold">
              Mute
            </Text>
            <Switch
              value={is_muted}
              onValueChange={(value) => setValue("is_muted", value)}
              trackColor={{
                false: colors.gray[300],
                true: colors.gray[500],
              }}
              size="sm"
              thumbColor={colors.gray[50]}
              ios_backgroundColor={colors.gray[300]}
            />
          </HStack>
        </Box>
      ) : reminder.is_completed ? (
        <Button size="xl" isDisabled variant="outline">
          <ButtonText>Completed</ButtonText>
        </Button>
      ) : (
        <Button size="xl" onPress={() => handleNotificationAction("done")}>
          <ButtonText>Done</ButtonText>
        </Button>
      )}
    </Card>
  );
}
