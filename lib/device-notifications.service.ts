import dayjs from "dayjs";
import * as Notifications from "expo-notifications";

type CategoryIdentifier = "reminder-actions";

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

  await Notifications.setNotificationCategoryAsync("reminder-actions", [
    {
      identifier: "DONE",
      buttonTitle: "Done",
      options: {
        isDestructive: false,
        opensAppToForeground: false,
      },
    },
    {
      identifier: "SKIP",
      buttonTitle: "Skip",
      options: {
        isDestructive: false,
        opensAppToForeground: false,
      },
    },
  ]);
}

export function markDoneSkipNotificationCategoryListener() {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const actionId = response.actionIdentifier;
    const data = response.notification.request.content.data;

    console.log(actionId, data);
  });
}

export async function createDeviceNotification(
  title: string,
  body: string,
  timestamp: string,
  identifier?: string,
  categoryIdentifier?: CategoryIdentifier,
  data?: { [key: string]: number | string | boolean }
) {
  return await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      categoryIdentifier,
      data,
    },
    trigger: {
      date: dayjs(timestamp).toDate(),
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
