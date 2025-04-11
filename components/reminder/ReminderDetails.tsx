import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  RepeatIcon,
} from "@/components/ui/icon";
import { updateReminderMuted } from "@/lib/db-service";
import { Reminder } from "@/lib/types";
import { formatFrequencyString, formatScheduleString } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Switch } from "@/components/ui/switch";
import colors from "tailwindcss/colors";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { getReminderNotifications } from "@/lib/db-source";
import dayjs from "dayjs";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { BlurView } from "expo-blur";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useWatch from "@/hooks/useWatch";

type Props = {
  reminder: Reminder;
};

const ZodSchema = z.object({
  is_muted: z.boolean(),
});

export default function ({ reminder }: Props) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [nextNotification, setNextNotification] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [hideNextNotification, setHideNextNotification] = useState(true);

  async function fetchData() {
    const notifications = await getReminderNotifications(reminder.id!);
    setNotifications(notifications);

    if (notifications[0]) {
      setNextNotification({
        date: dayjs(notifications[0].scheduled_at).format("YYYY-MM-DD"),
        time: dayjs(notifications[0].scheduled_at).format("h:mm a"),
      });
    }
  }

  useEffect(() => {
    fetchData();
  }, [reminder]);

  const { watch, setValue } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      is_muted: reminder.is_muted,
    },
  });

  const is_muted = watch("is_muted");

  useWatch(is_muted, async (newVal, oldVal) => {
    if (reminder && newVal !== oldVal)
      await updateReminderMuted(reminder.id!, newVal);
  });

  return (
    <VStack space="md">
      {reminder.description ? (
        <Heading size="lg">{reminder.description}</Heading>
      ) : null}
      <Box>
        <HStack className="justify-between items-start">
          <VStack space="sm">
            <Text size="xl">
              {formatFrequencyString(
                reminder.times,
                reminder.interval_num,
                reminder.interval_type
              )}
            </Text>
            <Box>
              {reminder.schedules.map((s) => (
                <Text size="xl" key={s.id}>
                  {formatScheduleString(s)}
                </Text>
              ))}
            </Box>
          </VStack>
          <HStack space="xl" className="items-center ">
            <Text size="xl" className="font-quicksand-semibold">
              Mute
            </Text>
            <Switch
              isDisabled={!!reminder.due_scheduled_at}
              value={is_muted}
              onValueChange={(value) => setValue("is_muted", value)}
              trackColor={{ false: colors.gray[300], true: colors.gray[500] }}
              thumbColor={colors.gray[50]}
              ios_backgroundColor={colors.gray[300]}
            />
          </HStack>
        </HStack>
      </Box>
      {reminder.due_scheduled_at ? (
        <HStack space="md">
          <Button size="xl" variant="outline" className="flex-1">
            <ButtonText>Skip</ButtonText>
          </Button>
          <Button size="xl" className="flex-1">
            <ButtonText>Done</ButtonText>
          </Button>
        </HStack>
      ) : (
        <>
          {nextNotification ? (
            <VStack space="sm">
              <Alert>
                <AlertIcon as={CheckCircleIcon} />
                <AlertText size="lg">Next Reminder on</AlertText>
                {hideNextNotification ? (
                  <Box className="relative w-[180px] h-10 -ml-1 -my-2">
                    <Box className="absolute inset-0 flex items-center justify-center">
                      <AlertText size="lg">
                        {nextNotification.date} at
                        {nextNotification.time}
                      </AlertText>
                    </Box>

                    <BlurView
                      intensity={20}
                      className="absolute top-0 bottom-0 right-0 left-0"
                    />
                  </Box>
                ) : (
                  <AlertText size="lg">
                    {nextNotification.date} at {nextNotification.time}
                  </AlertText>
                )}
              </Alert>
              <HStack space="md">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onPress={() => setHideNextNotification(!hideNextNotification)}
                >
                  <ButtonIcon
                    as={hideNextNotification ? EyeIcon : EyeOffIcon}
                  />
                  <ButtonText>
                    {hideNextNotification ? "Show" : "Hide"}
                  </ButtonText>
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                  <ButtonIcon as={RepeatIcon} />
                  <ButtonText>Reschedule</ButtonText>
                </Button>
              </HStack>
            </VStack>
          ) : null}
        </>
      )}
    </VStack>
  );
}
