import dayjs from "dayjs";
import * as Notifications from "expo-notifications";
import utc from "dayjs/plugin/utc";
import { formatFrequencyString } from "../utils/format";
import {
  updateNotificationResponse,
  getSoonestFutureNotificationsToSchedule,
} from "../notifications/notifications.service";
import {
  CATEGORY_RECURRING,
  CATEGORY_ONE_TIME,
  ACTION_SKIP,
  ACTION_DONE,
  ACTION_LATER,
  DATE_TIME_FORMAT,
} from "./device-notifications.constants";
import { $isSchedulingNotifications } from "./device-notifications.store";

dayjs.extend(utc);

type CategoryIdentifier =
  | typeof CATEGORY_RECURRING
  | typeof CATEGORY_ONE_TIME;

export async function setupAndConfigureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  await Notifications.setNotificationCategoryAsync(
    CATEGORY_RECURRING,
    [
      {
        identifier: ACTION_SKIP,
        buttonTitle: "Skip",
        options: {
          isDestructive: false,
          opensAppToForeground: false,
        },
      },
      {
        identifier: ACTION_DONE,
        buttonTitle: "Done",
        options: {
          isDestructive: false,
          opensAppToForeground: false,
        },
      },
    ]
  );

  await Notifications.setNotificationCategoryAsync(
    CATEGORY_ONE_TIME,
    [
      {
        identifier: ACTION_LATER,
        buttonTitle: "Do It Later",
        options: {
          isDestructive: false,
          opensAppToForeground: false,
        },
      },
      {
        identifier: ACTION_DONE,
        buttonTitle: "Done",
        options: {
          isDestructive: false,
          opensAppToForeground: false,
        },
      },
    ]
  );
}

export async function requestNotificationsPermission() {
  await Notifications.requestPermissionsAsync();
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

      if (actionId === ACTION_DONE) {
        await updateNotificationResponse(notificationId, "done");
      }

      if (actionId === ACTION_SKIP) {
        await updateNotificationResponse(notificationId, "skip");
      }

      if (actionId === ACTION_LATER) {
        await updateNotificationResponse(notificationId, "later");
      }

      if (
        actionId !== ACTION_LATER &&
        actionId !== ACTION_SKIP &&
        actionId !== ACTION_DONE &&
        data.reminderId
      ) {
        callback && callback(parseInt(data.reminderId));
      }
    }
  );
}

export function notificationReceivedListener(callback: () => void) {
  return Notifications.addNotificationReceivedListener(() => {
    callback();
  });
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
  // console.log(utcTimestamp);
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

export async function scheduleAllUpcomingNotifications() {
  // Solving a race condition that can set device notifications in a weird state 
  // if run multiple times at once without finishing.
  if ($isSchedulingNotifications.get()) return;
  $isSchedulingNotifications.set(true);

  // 1. Cancel all existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2. Fetch new ones from DB
  const notifications = await getSoonestFutureNotificationsToSchedule();

  // 3. Recreate each one
  for (const notification of notifications) {
    try {
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
          .format(DATE_TIME_FORMAT),
        identifier: notification.id.toString(),
        categoryIdentifier: notification.is_recurring
          ? CATEGORY_RECURRING
          : CATEGORY_ONE_TIME,
        data: {
          reminderId: notification.reminder_id,
          scheduledAt: notification.scheduled_at,
        },
      });
    } catch (err) {
      console.error(`Failed to schedule notification ${notification.id}:`, err);
    }
  }

  $isSchedulingNotifications.set(false);
}

export async function dismissFromNotificationCenter(notificationId: number) {
  await Notifications.dismissNotificationAsync(notificationId.toString());
}
