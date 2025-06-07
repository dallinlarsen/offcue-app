import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import {
  ArchiveArrowUp,
  ArchiveOutlineIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
  PencilIcon,
  RepeatIcon,
  TrashIcon,
  UndoIcon,
  VolumeHighIcon,
  VolumeMuteIcon,
} from "@/components/ui/icon";
import {
  formatFrequencyString,
  formatScheduleString,
} from "@/lib/utils/format";
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
import { Animated, ScrollView, TouchableOpacity } from "react-native";
import { STATUS_COLOR_MAP } from "@/constants";
import EditNotificationStatusActionsheet from "./EditNotificationStatusActionsheet";
import { useConfetti } from "@/hooks/useConfetti";
import DeleteReminderDialog from "./DeleteReminderDialog";
import ArchiveReminderDialog from "./ArchiveReminderDialog";
import { useRouter } from "expo-router";
import { Reminder } from "@/lib/reminders/reminders.types";
import {
  NotificationResponseStatus,
  RNotification,
} from "@/lib/notifications/notifications.types";
import {
  getPastNotificationsByReminderId,
  getNextUpcomingNotificationByReminderId,
  updateNotificationResponse,
  updateNotificationResponseOneTime,
  recalcFutureNotifications,
  undoOneTimeComplete,
} from "@/lib/notifications/notifications.service";
import {
  updateReminderArchived,
  updateReminderMuted,
} from "@/lib/reminders/reminders.service";
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from "../ui/menu";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetIcon,
  ActionsheetItem,
  ActionsheetItemText,
} from "../ui/actionsheet";
import { Divider } from "../ui/divider";
import { useRevenueCat } from "@/hooks/useRevenueCat";

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
  const { refetch } = useRevenueCat();

  const [pastNotifications, setPastNotificatons] = useState<RNotification[]>(
    []
  );
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
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  async function fetchData() {
    const notifications = await getPastNotificationsByReminderId(reminder.id!);
    const nextNotificationUpcoming =
      await getNextUpcomingNotificationByReminderId(reminder.id!);
    setPastNotificatons(notifications);
    if (nextNotificationUpcoming) {
      setNextNotification({
        date: dayjs(nextNotificationUpcoming.scheduled_at).format(
          "MMM D, YYYY"
        ),
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

  const opacity = useRef(new Animated.Value(1)).current;

  function pulseNextReminderAlert() {
    const pulse = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    Animated.sequence([
      pulse,
      pulse,
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }

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
      refetch();
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

  async function handleNotificationEditOpen(notification: RNotification) {
    setNotificationToUpdate(notification);
    setNotificationStatusUpdateOpen(true);
  }

  async function recalcFutureNotificationsHandler() {
    await recalcFutureNotifications(reminder.id!);
    await fetchData();
    pulseNextReminderAlert();
  }

  async function notificationEditUpdateHandler() {
    fetchData();
    onNotificationResponse();
  }

  async function restoreClickedHandler() {
    await updateReminderArchived(reminder.id!, false);
    await refetch();
    reloadAllData();
  }

  async function archiveClickedHandler() {
    setArchiveDialogOpen(false);
    reloadAllData();
  }

  async function undoClickedHandler() {
    await undoOneTimeComplete(reminder.id!);
    await refetch();
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

  async function closeActionMenuOnComplete(c: () => void) {
    await c();
    setActionMenuOpen(false);
  }

  return (
    <>
      <VStack space="md" className="flex-1">
        {reminder.description ? (
          <Heading size="lg">{reminder.description?.trim()}</Heading>
        ) : null}
        <Box>
          <VStack>
            <Text>
              {reminder.interval_type &&
                reminder.interval_num &&
                reminder.times && (
                  <Text size="xl">
                    {!reminder.is_recurring ? "Until this is complete, " : ""}
                    <Text className="font-bold" size="xl">
                      {reminder.is_recurring ? "Randomly" : "randomly"}
                    </Text>{" "}
                    remind me{" "}
                    <Text size="xl" className="font-bold">
                      {formatFrequencyString(
                        reminder.times,
                        reminder.interval_num,
                        reminder.interval_type
                      )}
                    </Text>
                  </Text>
                )}
              {reminder.schedules &&
                (reminder.schedules.length > 1 ? (
                  <Text size="xl">
                    {" "}
                    but only when:{" "}
                    {reminder.schedules.map((s, idx) => (
                      <Text key={idx} size="xl">
                        <Text size="xl">{"\n"}</Text>
                        <Text className="font-bold" size="xl">
                          {s.label}
                        </Text>{" "}
                        ({formatScheduleString(s)})
                      </Text>
                    ))}
                  </Text>
                ) : (
                  <Text size="xl">
                    {" "}
                    but only when{" "}
                    {reminder.schedules.map((s, idx) => (
                      <Text key={idx} size="xl">
                        <Text className="font-bold" size="xl">
                          {s.label}
                        </Text>{" "}
                        ({formatScheduleString(s)})
                      </Text>
                    ))}
                  </Text>
                ))}
            </Text>
          </VStack>
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
        {!reminder.due_scheduled_at &&
          ((nextNotification && !is_muted && !reminder.is_archived) ||
            (!reminder.is_completed && !reminder.is_archived && !is_muted)) && (
            <Animated.View style={{ opacity }}>
              {nextNotification && !is_muted ? (
                <Alert className="relative">
                  <AlertText size="lg">Next Reminder on</AlertText>
                  <Box
                    onTouchEnd={() =>
                      setHideNextNotification(!hideNextNotification)
                    }
                  >
                    {hideNextNotification ? (
                      <Box className="relative w-[200px] h-10 -ml-1 -my-2">
                        <Box className="absolute inset-0 flex items-center justify-center">
                          <AlertText size="lg">
                            {nextNotification.date} at
                            {nextNotification.time}
                          </AlertText>
                        </Box>

                        <BlurView
                          intensity={20}
                          className="absolute top-0 bottom-0 right-0 left-0 flex items-center justify-center"
                        >
                          <HStack space="md">
                            <Text className="flex-1 text-center">
                              Tap to show
                            </Text>
                          </HStack>
                        </BlurView>
                      </Box>
                    ) : (
                      <AlertText size="lg">
                        {nextNotification.date} at {nextNotification.time}
                      </AlertText>
                    )}
                  </Box>
                  <Box
                    className="absolute right-3 py-2"
                    onTouchEnd={() =>
                      setHideNextNotification(!hideNextNotification)
                    }
                  >
                    <Icon
                      className="text-typography-700"
                      as={hideNextNotification ? EyeIcon : EyeOffIcon}
                    />
                  </Box>
                </Alert>
              ) : !reminder.is_completed &&
                !reminder.is_archived &&
                !is_muted ? (
                <Alert className="relative">
                  <AlertText size="lg">Next Reminder on</AlertText>
                </Alert>
              ) : null}
            </Animated.View>
          )}
        {reminder.is_archived && (
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
        )}
        {is_muted && !reminder.is_archived && (
          <Alert>
            <AlertText size="lg">
              Muted on{" "}
              {dayjs(reminder.updated_at + "+00:00").format("MMM D, YYYY")} at{" "}
              {dayjs(reminder.updated_at + "+00:00").format("h:mm a")}
            </AlertText>
          </Alert>
        )}
        {reminder.is_completed && (
          <Alert action="success">
            <AlertIcon as={CheckCircleIcon} />
            <AlertText size="lg">
              Completed on {dayjs(reminder.completed_at).format("MMM D, YYYY")}{" "}
              at {dayjs(reminder.completed_at).format("h:mm a")}
            </AlertText>
          </Alert>
        )}
        <Button
          size="xl"
          variant="outline"
          className="px-4"
          onPress={() => setActionMenuOpen(true)}
        >
          <ButtonText>Actions</ButtonText>
          <ButtonIcon as={ChevronDownIcon} />
        </Button>
        {!reminder.is_recurring &&
          !reminder.is_completed &&
          !reminder.due_scheduled_at && (
            <Button size="xl" onPress={() => handleNotificationAction("done")}>
              <ButtonText>Done</ButtonText>
            </Button>
          )}
        {reminder.due_scheduled_at && (
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
              Notification sent on{" "}
              {dayjs(reminder.due_scheduled_at).format("MMM D, YYYY")} at{" "}
              {dayjs(reminder.due_scheduled_at).format("h:mm a")}
            </Text>
          </>
        )}

        {reminder.is_recurring && (
          <>
            <HStack className="items-end" space="lg">
              <Heading size="xl" className="mt-3">
                Notifications
              </Heading>
              {pastNotifications.length > 0 && (
                <Text className="-mt-3 text-typography-600">
                  Tap to edit status
                </Text>
              )}
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
                                  action={
                                    STATUS_COLOR_MAP[
                                      n.response_status || "no_response"
                                    ]
                                  }
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
      <Actionsheet
        isOpen={actionMenuOpen}
        onClose={() => setActionMenuOpen(false)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="items-start">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {!reminder.is_completed && !reminder.is_archived && (
            <ActionsheetItem
              key="edit"
              onPress={() =>
                closeActionMenuOnComplete(() =>
                  router.push(`/reminder/edit/${reminder.id}`)
                )
              }
            >
              <Icon
                as={PencilIcon}
                size="md"
                className="mr-2 fill-typography-900"
              />
              <ActionsheetItemText size="xl">Edit</ActionsheetItemText>
            </ActionsheetItem>
          )}
          {reminder.is_recurring &&
            !reminder.is_archived &&
            !reminder.due_scheduled_at && (
              <ActionsheetItem
                key="mute"
                onPress={() =>
                  closeActionMenuOnComplete(() =>
                    setValue("is_muted", !is_muted)
                  )
                }
              >
                <Icon
                  as={is_muted ? VolumeHighIcon : VolumeMuteIcon}
                  size="md"
                  className="mr-2 fill-typography-900"
                />
                <ActionsheetItemText size="xl">
                  {is_muted ? "Unmute" : "Mute"}
                </ActionsheetItemText>
              </ActionsheetItem>
            )}
          {!reminder.due_scheduled_at &&
            ((nextNotification && !is_muted) ||
              (!reminder.is_completed &&
                !reminder.is_archived &&
                !is_muted)) && (
              <ActionsheetItem
                key="reschedule"
                onPress={() =>
                  closeActionMenuOnComplete(recalcFutureNotificationsHandler)
                }
              >
                <Icon as={RepeatIcon} size="md" className="mr-2" />
                <ActionsheetItemText size="xl">
                  Reschedule Next Reminder
                </ActionsheetItemText>
              </ActionsheetItem>
            )}
          {reminder.is_recurring && !reminder.is_archived && (
            <>
              <Divider className="my-2" />
              <ActionsheetItem
                key="archive"
                onPress={() =>
                  closeActionMenuOnComplete(() => setArchiveDialogOpen(true))
                }
              >
                <Icon
                  as={ArchiveOutlineIcon}
                  size="md"
                  className="mr-2 fill-typography-900"
                />
                <ActionsheetItemText size="xl">Archive</ActionsheetItemText>
              </ActionsheetItem>
            </>
          )}
          {reminder.is_archived && (
            <ActionsheetItem
              key="restore"
              onPress={() => closeActionMenuOnComplete(restoreClickedHandler)}
            >
              <Icon
                as={ArchiveArrowUp}
                size="md"
                className="mr-2 fill-typography-900"
              />
              <ActionsheetItemText size="xl">Restore</ActionsheetItemText>
            </ActionsheetItem>
          )}
          {!reminder.is_recurring && reminder.is_completed && (
            <>
              <ActionsheetItem
                key="copy"
                onPress={() =>
                  closeActionMenuOnComplete(() =>
                    router.push(`/new-reminder?copy=${reminder.id}`)
                  )
                }
              >
                <Icon as={CopyIcon} size="md" className="mr-2" />
                <ActionsheetItemText size="xl">Copy</ActionsheetItemText>
              </ActionsheetItem>
              <ActionsheetItem
                key="undo"
                onPress={() => closeActionMenuOnComplete(undoClickedHandler)}
              >
                <Icon
                  as={UndoIcon}
                  size="md"
                  className="mr-2 fill-typography-900"
                />
                <ActionsheetItemText size="xl">Undo</ActionsheetItemText>
              </ActionsheetItem>
            </>
          )}
          {(reminder.is_archived || !reminder.is_recurring) && (
            <>
              <Divider className="my-2" />
              <ActionsheetItem
                key="delete"
                onPress={() =>
                  closeActionMenuOnComplete(() => setDeleteDialogOpen(true))
                }
              >
                <Icon
                  as={TrashIcon}
                  size="md"
                  className="mr-2 fill-typography-900"
                />
                <ActionsheetItemText size="xl">Delete</ActionsheetItemText>
              </ActionsheetItem>
            </>
          )}
        </ActionsheetContent>
      </Actionsheet>
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
