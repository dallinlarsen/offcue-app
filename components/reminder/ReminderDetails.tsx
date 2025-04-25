import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import {
  ArchiveArrowUp,
  ArchiveOutlineIcon,
  CheckCircleIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  RepeatIcon,
  TrashIcon,
  UndoIcon,
} from "@/components/ui/icon";
import { formatFrequencyString, formatScheduleString } from "@/lib/utils/format";
import { useEffect, useRef, useState } from "react";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Switch } from "@/components/ui/switch";
import colors from "tailwindcss/colors";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
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
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge, BadgeText } from "../ui/badge";
import { ScrollView, TouchableOpacity } from "react-native";
import { STATUS_COLOR_MAP } from "@/constants/utils";
import EditNotificationStatusActionsheet from "./EditNotificationStatusActionsheet";
import { useConfetti } from "@/hooks/useConfetti";
import DeleteReminderDialog from "./DeleteReminderDialog";
import ArchiveReminderDialog from "./ArchiveReminderDialog";
import { useRouter } from "expo-router";
import { Reminder } from "@/lib/reminders/reminders.types";
import { NotificationResponseStatus, RNotification } from "@/lib/notifications/notifications.types";
import {
  getPastNotificationsByReminderId,
  getNextUpcomingNotificationByReminderId,
  updateNotificationResponse,
  updateNotificationResponseOneTime,
  recalcFutureNotifications,
  undoOneTimeComplete,
} from "@/lib/notifications/notifications.service";
import { updateReminderArchived, updateReminderMuted } from "@/lib/reminders/reminders.service";

type Props = {
  reminder: Reminder;
  onNotificationResponse: () => void;
};

const ZodSchema = z.object({
  is_muted: z.boolean(),
});

export default function ({ reminder, onNotificationResponse }: Props) {
  const confetti = useConfetti();
  const router = useRouter();

  const [pastNotifications, setPastNotificatons] = useState<
    RNotification[]
  >([]);
  const [nextNotification, setNextNotification] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [hideNextNotification, setHideNextNotification] = useState(true);
  const [notificationStatusUpdateOpen, setNotificationStatusUpdateOpen] =
    useState(false);
  const [notificationToUpdate, setNotificationToUpdate] =
    useState<RNotification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  async function fetchData() {
    const notifications = await getPastNotificationsByReminderId(reminder.id!);
    const nextNotificationUpcoming = await getNextUpcomingNotificationByReminderId(
      reminder.id!
    );
    setPastNotificatons(notifications);
    if (nextNotificationUpcoming) {
      setNextNotification({
        date: dayjs(nextNotificationUpcoming.scheduled_at).format("MMM D, YYYY"),
        time: dayjs(nextNotificationUpcoming.scheduled_at).format("h:mm a"),
      });
    } else {
      setNextNotification(null);
    }
  }

  useEffect(() => {
    fetchData();
    showStartDate.current =
      dayjs(reminder.start_date).format("YYYY-MM-DD") !==
      dayjs(reminder.created_at).format("YYYY-MM-DD");

    showEndDate.current = !!reminder.end_date;
  }, [reminder]);

  const { watch, setValue } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      is_muted: reminder.is_muted,
    },
  });

  const is_muted = watch("is_muted");

  useWatch(is_muted, async (newVal, oldVal) => {
    if (reminder && newVal !== oldVal) {
      await updateReminderMuted(reminder.id!, newVal);
      reloadAllData();
    }
  });

  useWatch(reminder, async (newVal) => {
    setValue("is_muted", newVal.is_muted);
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
    notification: RNotification
  ) {
    setNotificationToUpdate(notification);
    setNotificationStatusUpdateOpen(true);
  }

  async function recalcFutureNotificationsHandler() {
    await recalcFutureNotifications(reminder.id!);
    fetchData();
  }

  async function notificationEditUpdateHandler() {
    fetchData();
    onNotificationResponse();
  }

  async function restoreClickedHandler() {
    await updateReminderArchived(reminder.id!, false);
    reloadAllData();
  }

  async function archiveClickedHandler() {
    setArchiveDialogOpen(false);
    reloadAllData();
  }

  async function undoClickedHandler() {
    await undoOneTimeComplete(reminder.id!);
    reloadAllData();
  }

  async function reloadAllData() {
    fetchData();
    onNotificationResponse();
  }

  const showStartDate = useRef(
    dayjs(reminder.start_date).format("YYYY-MM-DD") !==
      dayjs(reminder.created_at).format("YYYY-MM-DD")
  );

  const showEndDate = useRef(!!reminder.end_date);

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
            {reminder.is_recurring && !reminder.is_archived && (
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
          <Box>
            {showStartDate.current && !showEndDate.current ? (
              <Text size="xl">
                Starts on {dayjs(reminder.start_date).format("MMM D, YYYY")}
              </Text>
            ) : null}
            {showStartDate.current && showEndDate.current ? (
              <Text size="xl">
                Between {dayjs(reminder.start_date).format("MMM D, YYYY")} and{" "}
                {dayjs(reminder.end_date).format("MMM D, YYYY")}
              </Text>
            ) : null}
            {showEndDate.current && !showStartDate.current ? (
              <Text size="xl">
                Ends on {dayjs(reminder.end_date).format("MMM D, YYYY")}
              </Text>
            ) : null}
            {reminder.track_streak && (reminder.current_streak || 0) >= 2 && (
              <Text size="xl">🔥 {reminder.current_streak} in a row</Text>
            )}
          </Box>
        </Box>
        {reminder.due_scheduled_at ? (
          <>
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
            <Text className="-mt-2">
              Triggered on{" "}
              {dayjs(reminder.due_scheduled_at).format("MMM D, YYYY")} at{" "}
              {dayjs(reminder.due_scheduled_at).format("h:mma")}
            </Text>
          </>
        ) : (
          <>
            {nextNotification ? (
              <VStack space="sm">
                <Alert>
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
            ) : !reminder.is_completed && !reminder.is_archived && !is_muted ? (
              <Button
                size="xl"
                variant="outline"
                onPress={recalcFutureNotificationsHandler}
              >
                <ButtonIcon as={RepeatIcon} />
                <ButtonText>Reschedule</ButtonText>
              </Button>
            ) : null}
          </>
        )}
        {!reminder.is_recurring &&
          !reminder.is_completed &&
          !reminder.due_scheduled_at && (
            <Button size="xl" onPress={() => handleNotificationAction("done")}>
              <ButtonText>Done</ButtonText>
            </Button>
          )}
        {reminder.is_archived && (
          <>
            <Alert className="bg-orange-100 dark:bg-orange-950">
              <AlertIcon
                as={ArchiveOutlineIcon}
                className="fill-orange-800 dark:fill-orange-100"
              />
              <AlertText
                size="lg"
                className="text-orange-800 dark:text-orange-100"
              >
                Archived on{" "}
                {dayjs(reminder.updated_at + "+00:00").format("MMM D, YYYY")} at{" "}
                {dayjs(reminder.updated_at + "+00:00").format("h:mm a")}
              </AlertText>
            </Alert>
            <HStack space="md">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onPress={restoreClickedHandler}
              >
                <ButtonIcon
                  size="xl"
                  as={ArchiveArrowUp}
                  className="fill-typography-950"
                />
                <ButtonText>Restore</ButtonText>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onPress={() => setDeleteDialogOpen(true)}
              >
                <ButtonIcon
                  size="xl"
                  as={TrashIcon}
                  className="fill-typography-950"
                />
                <ButtonText>Delete</ButtonText>
              </Button>
            </HStack>
          </>
        )}
        {reminder.is_completed && (
          <>
            <Alert action="success">
              <AlertIcon as={CheckCircleIcon} />
              <AlertText size="lg">
                Completed on{" "}
                {dayjs(pastNotifications[0]?.response_at).format("MMM D, YYYY")}{" "}
                at {dayjs(pastNotifications[0]?.response_at).format("h:mm a")}
              </AlertText>
            </Alert>
            <HStack space="md">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onPress={undoClickedHandler}
              >
                <ButtonIcon
                  size="xl"
                  as={UndoIcon}
                  className="fill-typography-950"
                />
                <ButtonText>Undo Complete</ButtonText>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onPress={() => setDeleteDialogOpen(true)}
              >
                <ButtonIcon
                  size="xl"
                  as={TrashIcon}
                  className="fill-typography-950"
                />
                <ButtonText>Delete</ButtonText>
              </Button>
            </HStack>
            <Button
              size="xl"
              variant="outline"
              onPress={() => router.push(`/new-reminder?copy=${reminder.id}`)}
            >
              <ButtonIcon as={CopyIcon} />
              <ButtonText>Copy</ButtonText>
            </Button>
          </>
        )}
        {is_muted && !reminder.is_archived && (
          <>
            <Alert>
              <AlertText size="lg">
                Muted on{" "}
                {dayjs(reminder.updated_at + "+00:00").format("MMM D, YYYY")} at{" "}
                {dayjs(reminder.updated_at + "+00:00").format("h:mm a")}
              </AlertText>
            </Alert>
            <Button
              size="lg"
              variant="outline"
              onPress={() => setArchiveDialogOpen(true)}
            >
              <ButtonIcon
                size="xl"
                as={ArchiveOutlineIcon}
                className="fill-typography-950"
              />
              <ButtonText>Archive</ButtonText>
            </Button>
          </>
        )}
        {reminder.is_recurring && (
          <>
            <HStack className="items-end" space="lg">
              <Heading size="xl" className="mt-3">
                Notifications
              </Heading>
              <Text className="-mt-3 text-typography-600">
                Tap to edit status
              </Text>
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
                                  action={STATUS_COLOR_MAP[n.response_status || 'no_response']}
                                >
                                  <BadgeText>
                                    {n.response_status?.split("_").join(" ") ||
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
          </>
        )}
      </VStack>
      <EditNotificationStatusActionsheet
        isOpen={notificationStatusUpdateOpen}
        setIsOpen={setNotificationStatusUpdateOpen}
        notification={notificationToUpdate!}
        onUpdate={notificationEditUpdateHandler}
      />
      <ArchiveReminderDialog
        reminder={reminder}
        isOpen={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        onArchiveSuccess={archiveClickedHandler}
      />
      <DeleteReminderDialog
        reminder={reminder}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
