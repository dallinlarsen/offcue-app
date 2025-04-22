import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  RepeatIcon,
} from "@/components/ui/icon";
import {
  recalcFutureNotifications,
  updateNotificationResponse,
  updateNotificationResponseOneTime,
  updateReminderMuted,
} from "@/lib/db-service";
import {
  NotificationResponseStatus,
  Reminder,
  ReminderNotification,
} from "@/lib/types";
import { formatFrequencyString, formatScheduleString } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Switch } from "@/components/ui/switch";
import colors from "tailwindcss/colors";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import {
  getNextUpcomingNotification,
  getReminderPastNotifications,
} from "@/lib/db-source";
import dayjs from "dayjs";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { BlurView } from "expo-blur";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useWatch from "@/hooks/useWatch";
import {
  Table,
  TableBody,
  TableData,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card } from "../ui/card";
import { Badge, BadgeText } from "../ui/badge";
import { ScrollView, TouchableOpacity } from "react-native";
import { STATUS_COLOR_MAP } from "@/constants/utils";
import EditNotificationStatusActionsheet from "./EditNotificationStatusActionsheet";
import { useConfetti } from "@/hooks/useConfetti";

type Props = {
  reminder: Reminder;
  onNotificationResponse: () => void;
};

const ZodSchema = z.object({
  is_muted: z.boolean(),
});

export default function ({ reminder, onNotificationResponse }: Props) {
  const confetti = useConfetti();

  const [pastNotifications, setPastNotificatons] = useState<
    ReminderNotification[]
  >([]);
  const [nextNotification, setNextNotification] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [hideNextNotification, setHideNextNotification] = useState(true);
  const [notificationStatusUpdateOpen, setNotificationStatusUpdateOpen] =
    useState(false);
  const [notificationToUpdate, setNotificationToUpdate] =
    useState<ReminderNotification | null>(null);

  async function fetchData() {
    const notifications = await getReminderPastNotifications(reminder.id!);
    const nextNotificationUpcoming = await getNextUpcomingNotification(
      reminder.id!
    );
    setPastNotificatons(notifications);
    if (nextNotificationUpcoming) {
      setNextNotification({
        date: dayjs(nextNotificationUpcoming.scheduled_at).format("YYYY-MM-DD"),
        time: dayjs(nextNotificationUpcoming.scheduled_at).format("h:mm a"),
      });
    } else {
      setNextNotification(null);
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
    fetchData();

    onNotificationResponse();
  }

  async function handleNotificationEditOpen(
    notification: ReminderNotification
  ) {
    setNotificationToUpdate(notification);
    setNotificationStatusUpdateOpen(true);
  }

  async function recalcFutureNotificationsHandler() {
    await recalcFutureNotifications(reminder.id!);
    fetchData();
  }

  return (
    <>
      <VStack space="md" className="flex-1">
        {reminder.description ? (
          <Heading size="lg">{reminder.description}</Heading>
        ) : null}
        <Box>
          <HStack className="justify-between items-start">
            <VStack>
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
            {reminder.is_recurring && (
              <HStack space="xl" className="items-center ">
                <Text size="xl" className="font-quicksand-semibold">
                  Mute
                </Text>
                <Switch
                  isDisabled={!!reminder.due_scheduled_at}
                  value={is_muted}
                  onValueChange={(value) => setValue("is_muted", value)}
                  trackColor={{
                    false: colors.gray[300],
                    true: colors.gray[500],
                  }}
                  thumbColor={colors.gray[50]}
                  ios_backgroundColor={colors.gray[300]}
                />
              </HStack>
            )}
          </HStack>
        </Box>
        {reminder.due_scheduled_at ? (
          <HStack space="md">
            <Button
              size="xl"
              variant="outline"
              className="flex-1"
              onPress={() =>
                handleNotificationAction(
                  reminder.is_recurring ? "skip" : "later"
                )
              }
            >
              <ButtonText>
                {reminder.is_recurring ? "Skip" : "Do It Later"}
              </ButtonText>
            </Button>
            <Button
              size="xl"
              className="flex-1"
              onPress={() => handleNotificationAction("done")}
            >
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
                    onPress={() =>
                      setHideNextNotification(!hideNextNotification)
                    }
                  >
                    <ButtonIcon
                      as={hideNextNotification ? EyeIcon : EyeOffIcon}
                    />
                    <ButtonText>
                      {hideNextNotification ? "Show" : "Hide"}
                    </ButtonText>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onPress={recalcFutureNotificationsHandler}
                  >
                    <ButtonIcon as={RepeatIcon} />
                    <ButtonText>Reschedule</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            ) : null}
          </>
        )}
        {reminder.is_completed && (
          <Alert>
            <AlertIcon as={CheckCircleIcon} />
            <AlertText size="lg">
              Completed on{" "}
              {dayjs(pastNotifications[0]?.response_at).format("YYYY-MM-DD")} at{" "}
              {dayjs(pastNotifications[0]?.response_at).format("h:mm a")}
            </AlertText>
          </Alert>
        )}
        <HStack className="items-end" space="lg">
          <Heading size="xl" className="mt-3">
            Notifications
          </Heading>
          <Text className="-mt-3 text-typography-600">Tap to edit status</Text>
        </HStack>
        {pastNotifications.length > 0 ? (
          <>
            <Box className="rounded overflow-hidden w-full flex-1">
              <Table className="w-full flex-1">
                <TableHeader className="border-t border-x border-background-300">
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="flex-1">
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {pastNotifications.map((n, idx) => (
                      <TableRow
                        key={n.id}
                        className={`${
                          pastNotifications.length - 1 === idx
                            ? "-mb-1"
                            : "border-b"
                        } ${
                          idx === 0 ? "border-t" : ""
                        } border-x border-background-300
                          `}
                      >
                        <TouchableOpacity
                          onPress={() => handleNotificationEditOpen(n)}
                          className="flex flex-row flex-1"
                        >
                          <TableData className="flex-1">
                            {dayjs(n.scheduled_at).format(
                              "MMM D, YYYY\nh:mm a"
                            )}
                          </TableData>
                          <TableData className="flex items-center w-full flex-1">
                            <Badge
                              size="xl"
                              action={STATUS_COLOR_MAP[n.response_status]}
                            >
                              <BadgeText>
                                {n.response_status.split("_").join(" ") ||
                                  "Pending"}
                              </BadgeText>
                            </Badge>
                          </TableData>
                        </TouchableOpacity>
                      </TableRow>
                    ))}
                    <Box className="h-28" />
                  </ScrollView>
                </TableBody>
              </Table>
            </Box>
          </>
        ) : (
          <Text>No Notificaitons Found</Text>
        )}
      </VStack>
      <EditNotificationStatusActionsheet
        isOpen={notificationStatusUpdateOpen}
        setIsOpen={setNotificationStatusUpdateOpen}
        notification={notificationToUpdate!}
        onUpdate={() => fetchData()}
        recurring={reminder.is_recurring}
      />
    </>
  );
}
