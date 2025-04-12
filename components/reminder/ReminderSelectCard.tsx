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
  updateReminderMuted,
} from "@/lib/db-service";
import { NotificationResponseStatus, Reminder } from "@/lib/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useWatch from "@/hooks/useWatch";
import { Button, ButtonText } from "../ui/button";

type Props = {
  reminder: Reminder;
  onNotificationResponse: () => void;
};

const ZodSchema = z.object({
  is_muted: z.boolean(),
});

export default function ({ reminder, onNotificationResponse }: Props) {
  const router = useRouter();

  const { watch, setValue } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      is_muted: reminder.is_muted,
    },
  });

  const is_muted = watch("is_muted");

  useWatch(is_muted, async (newVal) => {
    await updateReminderMuted(reminder.id!, newVal);
  });

  useWatch(reminder, (r) => {
    setValue("is_muted", r.is_muted);
  });

  async function handleNotificationAction(
    response: NotificationResponseStatus
  ) {
    if (reminder.due_notification_id) {
      await updateNotificationResponse(reminder.due_notification_id, response);
      onNotificationResponse();
    }
  }

  return (
    <Card
      variant={reminder.due_scheduled_at ? 'outline' : 'filled'}
      className={`${ reminder.due_scheduled_at ? 'bg-background-50' : 'bg-background-100' } p-3 flex-1 aspect-square justify-between`}
    >
      <TouchableOpacity
        onPress={() => router.push(`/reminder/${reminder.id}`)}
        className="flex-1"
      >
        <VStack>
          <Heading numberOfLines={2} className="font-quicksand-bold" size="lg">
            {reminder.title}
          </Heading>
          {!reminder.due_scheduled_at && (
            <>
              <Text>
                {formatFrequencyString(
                  reminder.times,
                  reminder.interval_num,
                  reminder.interval_type
                )}
              </Text>
              <Text>{formatScheduleString(reminder.schedules[0])}</Text>
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
            onPress={() => handleNotificationAction("skip")}
          >
            <ButtonText>Skip</ButtonText>
          </Button>
          <Button size="xl" onPress={() => handleNotificationAction("done")}>
            <ButtonText>Done</ButtonText>
          </Button>
        </VStack>
      ) : (
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
      )}
    </Card>
  );
}
