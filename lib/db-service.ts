import * as db_source from "./db-source";
import { createInitialNotifications, recalcFutureNotifications } from "./db-service-notifications";
import { NotificationResponseStatus } from "./types";
import { scheduleAllUpcomingNotifications } from "./device-notifications.service";
import dayjs from "dayjs";
import { appLoop } from "./app-loop.service";

export {
  getScheduleReminders,
  getReminderPastNotifications,
  getFutureNotifications,
  getSoonestFutureNotificationsToSchedule,
  updateReminder,
  setTheme,
} from "./db-source";
export {
  processReminderNotifications,
  recalcFutureNotifications,
} from "./db-service-notifications";

export const createDatabase = async () => {
  db_source.initDatabase();
};

/////////////////////////////////////////
////////// CRUD for reminders //////////
///////////////////////////////////////

//Create
export const createReminder = async (
  title: string,
  description: string,
  intervalType: string,
  intervalNum: number,
  times: number,
  scheduleIds: number[],
  trackStreak: boolean,
  trackNotes: boolean,
  muted: boolean,
  recurring: boolean,
  start_date?: string,
  end_date?: string
) => {
  const result = await db_source.createReminder(
    title,
    description,
    intervalType,
    intervalNum,
    times,
    scheduleIds,
    trackStreak,
    trackNotes,
    muted,
    recurring,
    start_date,
    end_date
  );

  // Create notifications for the reminder
  await createInitialNotifications(result);
  await appLoop();

  return result;
};

//Read
export const getReminder = async (id: number) => {
  const reminder = await db_source.getAllOrOneReminders(id);
  return reminder[0];
};

//Update Muted
export const updateReminderMuted = async (id: number, isMuted: boolean) => {
  const result = await db_source.updateReminderMuted(id, isMuted);
  if (isMuted) {
    await db_source.deleteFutureNotifications(id);
  } else {
    // TODO: When future notification generation is implemented call it here.
    await recalcFutureNotifications(id);
  }

  await appLoop();

  return result;
};

//Update Archived
export const updateReminderArchived = async (
  id: number,
  isArchived: boolean
) => {
  const result = await db_source.updateReminderArchived(id, isArchived);
  if (isArchived) {
    await db_source.deleteFutureNotifications(id);
  } else {
    // TODO: When future notification generation is implemented call it here.
    await recalcFutureNotifications(id);
  }

  await appLoop();

  return result;
};

//Delete
export const deleteReminder = async (id: number) => {
  const result = await db_source.deleteReminder(id);

  await appLoop();
  return result;
};

/////////////////////////////////////
////////// CRUD for Notes //////////
///////////////////////////////////

// TODO: Will implement notes later
// It is not in our MVP

/////////////////////////////////////////
////////// CRUD for schedules //////////
///////////////////////////////////////

//Create
export const createSchedule = async (
  label: string,
  isSunday: boolean,
  isMonday: boolean,
  isTuesday: boolean,
  isWednesday: boolean,
  isThursday: boolean,
  isFriday: boolean,
  isSaturday: boolean,
  startTime: string,
  endTime: string
) => {
  const result = await db_source.createSchedule(
    label,
    isSunday,
    isMonday,
    isTuesday,
    isWednesday,
    isThursday,
    isFriday,
    isSaturday,
    startTime,
    endTime
  );
  return result;
};

//Read
export const getSchedule = async (id: number) => {
  const schedule = await db_source.getSchedule(id);
  return schedule;
};

//Update
export const updateSchedule = async (
  id: number,
  label: string,
  isSunday: boolean,
  isMonday: boolean,
  isTuesday: boolean,
  isWednesday: boolean,
  isThursday: boolean,
  isFriday: boolean,
  isSaturday: boolean,
  startTime: string,
  endTime: string
) => {
  const result = await db_source.updateSchedule(
    id,
    label,
    isSunday,
    isMonday,
    isTuesday,
    isWednesday,
    isThursday,
    isFriday,
    isSaturday,
    startTime,
    endTime
  );
  return result;
};

//Delete
export const deleteSchedule = async (id: number) => {
  const result = await db_source.deleteSchedule(id);
  return result;
};

///////////////////////////////////////
////////// Get All Entities //////////
/////////////////////////////////////

// Get All Reminders
export const getAllReminders = async () => {
  const notifications = await db_source.getAllOrOneReminders();
  return notifications;
};

// Get All Notifications for a Reminder
export const getAllSchedules = async () => {
  const notifications = await db_source.getAllSchedules();
  return notifications;
};

////////////////////////////////////////////////////
////////// Get All Entities For Reminder //////////
//////////////////////////////////////////////////

// Get All Notifications for a Reminder
export const getNotificationsForReminder = async (reminderId: number) => {
  const notifications = await db_source.getReminderNotifications(reminderId);
  return notifications;
};

// Get Open Notifications for a Reminder
export const getOpenNotificationsForReminder = async (reminderId: number) => {
  const notifications = await db_source.getUnrespondedReminderNotifications(
    reminderId
  );
  return notifications;
};

export async function updateNotificationResponse(
  id: number,
  responseStatus: NotificationResponseStatus,
  recurring?: boolean
) {
  await db_source.updateNotificationResponse(id, responseStatus);
  if (recurring !== undefined && !recurring && responseStatus === "done") {
    const notification = await db_source.getNotification(id);
    if (notification?.reminder_id) {
      await db_source.deleteFutureNotifications(notification.reminder_id);
    }
  } else if (recurring !== undefined && !recurring && responseStatus === 'later') {
    const notification = await db_source.getNotification(id);
    if (notification?.reminder_id) {
      await recalcFutureNotifications(notification.reminder_id);
    }
  }
  await appLoop();
}

export async function undoOneTimeComplete(reminderId: number) {
  const lastDoneNotification = await db_source.getLastDoneNotification(reminderId);
  if (lastDoneNotification) {
    return await updateNotificationResponse(lastDoneNotification.id, 'later', false);
  }
}

export async function updateNotificationResponseOneTime(
  reminderId: number,
  responseStatus: NotificationResponseStatus
) {
  const notification = await db_source.getNextNotification(reminderId);
  await db_source.updateNotificationResponse(notification.id, responseStatus);
  if (responseStatus === "done") {
    await db_source.updateNotificationScheduledAt(
      notification.id,
      dayjs().utc().format("YYYY-MM-DD hh:mmZ")
    );
    await db_source.deleteFutureNotifications(reminderId);
  }
  await appLoop();
}

////////////////////////////////////////////
////////// Functions for testing //////////
//////////////////////////////////////////

// Function to wipe the database and reinitialize it
// This is useful for development purposes or when you want to reset the database
// There is a button on the home page that calls this function
export const wipeDatabase = async () => {
  db_source.wipeDatabase();
};

// Force the recreation of notifications
// First delete the existing notifications in the current interval index
// Then create new notifications
export const deleteNotificationsInInterval = async (
  reminderId: number
): Promise<void> => {
  // Get the interval index of the reminder
  const currentNotification =
    await db_source.getUnrespondedReminderNotifications(reminderId);
  console.log("Current Notification: ", currentNotification);
  const currentIntervalIndex = currentNotification[0].interval_index;
  console.log("Current Interval Index: ", currentIntervalIndex);

  // Delete all notifications in the current interval index
  await db_source.deleteNotificationsInInterval(
    reminderId,
    currentIntervalIndex
  );
};
