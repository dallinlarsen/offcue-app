import dayjs from "dayjs";
import * as Notifications from "expo-notifications";
import utc from "dayjs/plugin/utc";
import {
  getSoonestFutureNotificationsToSchedule,
  updateNotificationResponse,
} from "./db-service";
import { formatFrequencyString } from "./utils";
import { router } from "expo-router";

dayjs.extend(utc);

type CategoryIdentifier =
  | "reminder-actions-recurring"
  | "reminder-actions-one-time";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function setupAndConfigureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  await Notifications.requestPermissionsAsync();

  await Notifications.setNotificationCategoryAsync(
    "reminder-actions-recurring",
    [
      {
        identifier: "SKIP",
        buttonTitle: "Skip",
        options: {
          isDestructive: false,
          opensAppToForeground: false,
        },
      },
      {
        identifier: "DONE",
        buttonTitle: "Done",
        options: {
          isDestructive: false,
          opensAppToForeground: false,
        },
      },
    ]
  );

  await Notifications.setNotificationCategoryAsync(
    "reminder-actions-one-time",
    [
      {
        identifier: "LATER",
        buttonTitle: "Do It Later",
        options: {
          isDestructive: false,
          opensAppToForeground: false,
        },
      },
      {
        identifier: "DONE",
        buttonTitle: "Done",
        options: {
          isDestructive: false,
          opensAppToForeground: false,
        },
      },
    ]
  );
}

export function markDoneSkipNotificationCategoryListener(
  callback?: (reminderId: number) => void
) {
  return Notifications.addNotificationResponseReceivedListener(
    async (response) => {
      const actionId = response.actionIdentifier;
      const data = response.notification.request.content.data;
      const notificationId = parseInt(response.notification.request.identifier);

      if (!notificationId) return;

      if (actionId === "DONE") {
        await updateNotificationResponse(notificationId, "done");
      }

      if (actionId === "SKIP") {
        await updateNotificationResponse(notificationId, "skip");
      }

      if (actionId === "LATER") {
        await updateNotificationResponse(notificationId, "later");
      }

      if (
        actionId !== "LATER" &&
        actionId !== "SKIP" &&
        actionId !== "DONE" &&
        data.reminderId
      ) {
        callback && callback(parseInt(data.reminderId));
      }
    }
  );
}

type CreateDeviceNotification = {
  title: string;
  body: string;
  utcTimestamp: string;
  identifier?: string;
  categoryIdentifier?: CategoryIdentifier;
  data?: { [key: string]: number | string | boolean };
};

export async function createDeviceNotification({
  title,
  body,
  utcTimestamp,
  identifier,
  categoryIdentifier,
  data,
}: CreateDeviceNotification) {
  console.log(utcTimestamp);
  return await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      categoryIdentifier,
      data,
    },
    trigger: {
      date: dayjs(utcTimestamp).utc(true).toDate(),
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });
}

export async function getAllScheduledNotifications() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications.map((n) => ({
    identifier: n.identifier,
    title: n.content.title,
    body: n.content.body,
    data: n.content.data,
    original: n,
  }));
}

export async function cancelScheduledNotifications() {
  return await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAllUpcomingNotifications() {
  console.log("Scheduling notifications...");

  const notifications = await getSoonestFutureNotificationsToSchedule();
  const scheduledNotifications = await getAllScheduledNotifications();
  const scheduledNotificationsIds = scheduledNotifications.map(
    (s) => s.identifier
  );

  // Remove scheduled notifications not in the notification set
  const notificationIds = notifications.map((n) => n.id.toString());
  const notificationsToDelete = scheduledNotificationsIds.filter(
    (s) => !notificationIds.includes(s)
  );

  for (const notificationId of notificationsToDelete) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Add all not scheduled notifications
  for (const notification of notifications) {
    if (!scheduledNotificationsIds.includes(notification.id.toString())) {
      await createDeviceNotification({
        title: notification.title,
        body:
          notification.description ||
          formatFrequencyString(
            notification.times,
            notification.interval_num,
            notification.interval_type
          ),
        utcTimestamp: dayjs(notification.scheduled_at)
          .utc()
          .format("YYYY-MM-DD HH:mm:ss"),
        identifier: notification.id.toString(),
        categoryIdentifier: notification.is_recurring
          ? "reminder-actions-recurring"
          : "reminder-actions-one-time",
        data: {
          reminderId: notification.reminder_id,
          scheduledAt: notification.scheduled_at,
        },
      });
    }
  }
}
