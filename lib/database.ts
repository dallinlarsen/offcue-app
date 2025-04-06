import * as SQLite from 'expo-sqlite';

import {
  calculateIntervalEnd,
  getScheduleWindowsWithinInterval,
  mergeTimeWindows,
  getTimeAtTotalOffset,
  getRandomTime,
  generateNotificationTimes,
  calculateScheduledTime
} from "./notification-logic";

async function openDB() {
  return await SQLite.openDatabaseAsync('reminders.db');
}

// Function to initialize the database and create tables
export const initDatabase = async (): Promise<void> => {
  const db = await openDB();
  await db.execAsync(`CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,                  -- Required title of the reminder
    description TEXT,                     -- Optional description of the reminder
    interval_type TEXT NOT NULL,          -- The type of interval (e.g., "minute", "hour", "day", "week", "month", "year")
    interval_num INTEGER NOT NULL,        -- The length of the interval (e.g., number of minutes, hours, days, etc.)
    times INTEGER NOT NULL,               -- The number of times the reminder should occur in the defined interval
    track_streak INTEGER NOT NULL,        -- Whether to track streaks (1 for true, 0 for false)
    track_notes INTEGER NOT NULL,         -- Whether to track notes (1 for true, 0 for false)
    is_muted INTEGER NOT NULL DEFAULT 0,  -- Whether the reminder is muted (1 for true, 0 for false)
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the reminder was created
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP -- The time the reminder was last updated
  );`);
  console.log("✅ Reminders table created successfully");

  await db.execAsync(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL,             -- Foreign key to reminders table
    scheduled_at DATETIME NOT NULL,           -- The time the notification is scheduled for
    is_scheduled INTEGER NOT NULL DEFAULT 0,  -- Whether the notification is scheduled (1 for true, 0 for false)
    interval_index INTEGER NOT NULL,          -- The index of the interval for the notification
    segment_index INTEGER NOT NULL,           -- The index of the segment for the notification
    response_at DATETIME,                     -- The time the user responded to the notification
    response_status TEXT,                     -- The status of the user's response (e.g., "done", "skipped")
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the notification was created                                            
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the notification was last updated
    FOREIGN KEY (reminder_id) REFERENCES reminders (id) ON DELETE CASCADE
  );`);
  console.log("✅ Notifications table created successfully");

  await db.execAsync(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL,   -- Foreign key to reminders table
    notification_id INTEGER,        -- Foreign key to notifications table if the note is related to a notification
    note TEXT NOT NULL,             -- The note text
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the note was created
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the note was last updated
    FOREIGN KEY (reminder_id) REFERENCES reminders (id) ON DELETE CASCADE,
    FOREIGN KEY (notification_id) REFERENCES notifications (id) ON DELETE CASCADE
  );`);
  console.log("✅ Notes table created successfully");

  await db.execAsync(`CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY NOT NULL,
    label TEXT NOT NULL,                      -- Label for the schedule
    is_sunday INTEGER NOT NULL DEFAULT 0,     -- Whether the schedule is on Sunday (1 for true, 0 for false)
    is_monday INTEGER NOT NULL DEFAULT 0,     -- Whether the schedule is on Monday (1 for true, 0 for false)
    is_tuesday INTEGER NOT NULL DEFAULT 0,    -- Whether the schedule is on Tuesday (1 for true, 0 for false)
    is_wednesday INTEGER NOT NULL DEFAULT 0,  -- Whether the schedule is on Wednesday (1 for true, 0 for false)
    is_thursday INTEGER NOT NULL DEFAULT 0,   -- Whether the schedule is on Thursday (1 for true, 0 for false)
    is_friday INTEGER NOT NULL DEFAULT 0,     -- Whether the schedule is on Friday (1 for true, 0 for false)
    is_saturday INTEGER NOT NULL DEFAULT 0,   -- Whether the schedule is on Saturday (1 for true, 0 for false)
    start_time TEXT NOT NULL,                 -- Start time of the schedule in HH:MM format
    end_time TEXT NOT NULL,                   -- End time of the schedule in HH:MM format
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the schedule was created
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP -- The time the schedule was last updated
  );`);
  console.log("✅ Schedule table created successfully");

  await db.execAsync(`CREATE TABLE IF NOT EXISTS reminder_schedule (
    id INTEGER PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL,             -- Foreign key to reminders table
    schedule_id INTEGER NOT NULL,             -- Foreign key to schedule table
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the reminder schedule was created
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the reminder schedule was last updated
    FOREIGN KEY (reminder_id) REFERENCES reminders (id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedule (id) ON DELETE CASCADE
  );`);
  console.log("✅ Reminder schedule table created successfully");
};

////////// Functions related to reminders //////////

// Function to save a reminder
export const saveReminder = async (
  title: string,
  description: string,
  intervalType: string,
  intervalNum: number,
  times: number,
  trackStreak: boolean,
  trackNotes: boolean,
  muted: boolean
): Promise<void> => {
  const db = await openDB();
  const result = await db.runAsync(
    `INSERT INTO reminders (title, description, interval_type, interval_num, times, track_streak, track_notes, is_muted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [title, description, intervalType, intervalNum, times, trackStreak ? 1 : 0, trackNotes ? 1 : 0, muted ? 1 : 0]
  );
  console.log("✅ Reminder saved successfully", result);

  const reminderId = result.lastInsertRowId;
  console.log("Reminder:", fetchReminderById(reminderId));

  refreshReminderNotifications(reminderId);
};

// Function to fetch all reminders
export const fetchReminders = async (): Promise<any[]> => {
  const db = await openDB();
  const reminders = await db.getAllAsync(`SELECT * FROM reminders;`, []);
  return reminders;
};

// function to fetch a specific reminder by ID
export const fetchReminderById = async (id: number): Promise<any> => {
  const db = await openDB();
  const reminder = await db.getFirstAsync(`SELECT * FROM reminders WHERE id = ?;`, [id]);
  return reminder;
};

// Function to fetch a specific reminder by ID
export const updateReminderMuted = async (id: number, muted: boolean): Promise<void> => {
  const db = await openDB();
  await db.runAsync(
    `UPDATE reminders SET is_muted = ? WHERE id = ?;`,
    [muted ? 1 : 0, id]
  );
  console.log("✅ Reminder muted state updated");
};

////////// Functions related to notifications //////////

// Function to save a notification
export const saveNotification = async (
  reminderId: number,
  scheduledAt: string,
  isScheduled: boolean,
  intervalIndex: number,
  segmentIndex: number
): Promise<void> => {
  const db = await openDB();
  const result = await db.runAsync(
    `INSERT INTO notifications (reminder_id, scheduled_at, is_scheduled, interval_index, segment_index)
     VALUES (?, ?, ?, ?, ?);`,
    [reminderId, scheduledAt, isScheduled ? 1 : 0, intervalIndex, segmentIndex]
  );
  console.log("✅ Notification saved successfully", result);
  const notificationId = result.lastInsertRowId;
  console.log("Notification:", fetchNotificationById(notificationId));
};

// Function to fetch a specific notification by ID
export const fetchNotificationById = async (id: number): Promise<any> => {
  const db = await openDB();
  const notification = await db.getFirstAsync(`SELECT * FROM notifications WHERE id = ?;`, [id]);
  return notification;
};

// Function to fetch all notifications for a specific reminder
export const fetchNotificationsForReminder = async (reminderId: number): Promise<any[]> => {
  const db = await openDB();
  const notifications = await db.getAllAsync(
    `SELECT * FROM notifications WHERE reminder_id = ?;`,
    [reminderId]
  );
  return notifications;
};

// Function to update notification status (e.g., marking as scheduled, setting response time/status)
export const updateNotificationStatus = async (
  notificationId: number,
  isScheduled: boolean,
  responseAt: string | null,
  responseStatus: string | null
): Promise<void> => {
  const db = await openDB();
  await db.runAsync(
    `UPDATE notifications 
     SET is_scheduled = ?, response_at = ?, response_status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?;`,
    [isScheduled ? 1 : 0, responseAt, responseStatus, notificationId]
  );
  console.log("✅ Notification updated successfully");
};

// Function to reschedule a notification
export const rescheduleNotification = async (
  notificationId: number,
  newScheduledAt: string
): Promise<void> => {
  const db = await openDB();
  await db.runAsync(
    `UPDATE notifications 
     SET scheduled_at = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?;`,
    [newScheduledAt, notificationId]
  );
  console.log("✅ Notification rescheduled successfully");
};

////////// Functions related to handling notification logic //////////

// Helper function to mark a notification as resolved
export const markNotificationAsResolved = async (notificationId: number, responseStatus: string): Promise<void> => {
  const responseAt = new Date().toISOString();
  await updateNotificationStatus(notificationId, false, responseAt, responseStatus);
  console.log("✅ Notification marked as resolved");
};

// Helper function to schedule the next notification for a reminder
export const scheduleNextNotification = async (reminderId: number): Promise<void> => {
  const nextNotification = await getNextNotification(reminderId);
  if (nextNotification) {
    await updateNotificationStatus(nextNotification.id, true, null, null);
    console.log("✅ Next notification scheduled", nextNotification.id);
  }
};

// Helper function to get schedules for a given reminder
export const getSchedulesForReminder = async (reminderId: number): Promise<any[]> => {
  const db = await openDB();
  // Join the reminder_schedule table with the schedule table to get the schedule details
  const schedules = await db.getAllAsync(
    `SELECT s.* FROM schedule s 
     INNER JOIN reminder_schedule rs ON rs.schedule_id = s.id 
     WHERE rs.reminder_id = ?;`,
    [reminderId]
  );
  return schedules;
};

// New function to refresh notifications after a reminder is saved or a notification is updated
export const refreshReminderNotifications = async (reminderId: number): Promise<void> => {
  console.log("Refreshing reminder notifications...");
  try {
    console.log("Starting step 1...");
    // 1. Fetch the reminder record
    const reminders = await fetchReminders();
    const reminder = reminders.find((r: any) => r.id === reminderId);
    if (!reminder) {
      console.error(`Reminder with id ${reminderId} not found.`);
      return;
    }
    console.log("Reminder fetched:", reminder);

    console.log('Starting step 2...');
    // 2. Determine the current interval index
    // Use the next unscheduled notification if available; otherwise, default to interval index 0.
    const nextNotification = await getNextNotification(reminderId);
    const currentIntervalIndex = nextNotification ? nextNotification.interval_index : 0;
    console.log("Current interval index:", currentIntervalIndex);

    console.log('Starting step 3...');
    // 3. Fetch all notifications for the current interval
    const notificationsForCurrentInterval = await getNotificationsByInterval(reminderId, currentIntervalIndex);
    // Check if all notifications in the current interval have been resolved (i.e. response_at is not null)
    const allResolved = notificationsForCurrentInterval.every((n: any) => n.response_at !== null);
    console.log("All notifications resolved:", allResolved);

    if (!allResolved) {
      console.log("Not all notifications for the current interval are resolved. No new notifications will be created.");
      return;
    }

    console.log('Starting step 4...');
    // 4. Retrieve schedules for the reminder (if any)
    const schedules = await getSchedulesForReminder(reminderId);
    console.log("Schedules for reminder:", schedules);

    console.log('Starting step 5...');
    // 5. Calculate new notification times for the next interval (currentIntervalIndex + 1)
    let newNotifications;
    if (schedules && schedules.length > 0) {
      console.log("Schedules exist, generating notification times based on schedules...");
      // If schedules exist, use the schedule-based generator
      newNotifications = generateNotificationTimes(reminder, schedules, currentIntervalIndex + 1);
    } else {
      console.log("No schedules found, using fallback logic...");
      // No schedules: fall back to the simpler evenly-spaced notifications
      // createNotificationsForInterval calls calculateScheduledTime internally.
      await createNotificationsForInterval(reminder, currentIntervalIndex + 1);
      console.log(`Notifications for interval ${currentIntervalIndex + 1} created using fallback logic.`);
      return;
    }

    console.log('Starting step 6...');
    // 6. Create notifications in the database from the generated notification times
    for (const notif of newNotifications) {
      // Here, we set isScheduled to true for the first notification (segment_index 0)
      await saveNotification(
        reminder.id,
        notif.scheduled_at,
        notif.segment_index === 0,
        notif.interval_index,
        notif.segment_index
      );
    }

    console.log(`Notifications for interval ${currentIntervalIndex + 1} have been created.`);

  } catch (error) {
    console.error("Error in refreshReminderNotifications:", error);
  }
};

// Helper function return all notifications given a specific interval_index
export const getNotificationsByInterval = async (reminderId: number, intervalIndex: number): Promise<any[]> => {
  const db = await openDB();
  const notifications = await db.getAllAsync(
    `SELECT * FROM notifications WHERE reminder_id = ? AND interval_index = ?;`,
    [reminderId, intervalIndex]
  );
  return notifications;
};

// Function to process the current interval for a reminder
export const processCurrentInterval = async (reminderId: number): Promise<void> => {
  try {
    // Fetch the next unscheduled notification
    const nextNotification = await getNextNotification(reminderId);

    // Determine current interval index; if there is a next notification, use its interval_index,
    // otherwise, assume the last created interval. (You may adjust this logic as needed.)
    const currentIntervalIndex = nextNotification ? nextNotification.interval_index : 0;

    // Fetch all notifications for the current interval.
    const notificationsForCurrentInterval = await getNotificationsByInterval(reminderId, currentIntervalIndex);

    // Check if all notifications in the current interval are resolved (i.e., response_at is not null)
    const allResolved = notificationsForCurrentInterval.every((n: any) => n.response_at !== null);

    if (allResolved) {
      // Retrieve reminder data (assume you have a reminder object)
      const reminderList = await fetchReminders();
      const reminder = reminderList.find((r: any) => r.id === reminderId);

      if (!reminder) {
        console.error('Reminder not found');
        return;
      }

      // Create notifications for the next interval
      const nextIntervalIndex = currentIntervalIndex + 1;
      await createNotificationsForInterval(reminder, nextIntervalIndex);
    } else {
      console.log('Current interval is not yet complete. Waiting for all notifications to be resolved.');
    }
  } catch (error) {
    console.error('Error processing the current interval:', error);
  }
};

// Helper function to get the next unscheduled notification for a reminder
export const getNextNotification = async (reminderId: number): Promise<any> => {
  const db = await openDB();
  const notification = await db.getFirstAsync(
    `SELECT * FROM notifications WHERE reminder_id = ? AND is_scheduled = 0 ORDER BY interval_index ASC, segment_index ASC;`,
    [reminderId]
  );
  return notification;
};

// Helper function to create notifications for a specific interval
export const createNotificationsForInterval = async (reminder: any, intervalIndex: number): Promise<void> => {
  for (let segmentIndex = 0; segmentIndex < reminder.times; segmentIndex++) {
    const scheduledAt = calculateScheduledTime(reminder, intervalIndex, segmentIndex);
    // Only the first notification in the interval is marked as scheduled
    await saveNotification(reminder.id, scheduledAt, segmentIndex === 0, intervalIndex, segmentIndex);
  }
};

////////// Functions related to notes //////////

// Function to save a note (optionally linked to a notification)
export const saveNote = async (
  reminderId: number,
  note: string,
  notificationId?: number
): Promise<void> => {
  const db = await openDB();
  const result = await db.runAsync(
    `INSERT INTO notes (reminder_id, notification_id, note)
     VALUES (?, ?, ?);`,
    [reminderId, notificationId || null, note]
  );
  console.log("✅ Note saved successfully", result);
};

// Function to fetch all notes for a given reminder
export const fetchNotesForReminder = async (reminderId: number): Promise<any[]> => {
  const db = await openDB();
  const notes = await db.getAllAsync(
    `SELECT * FROM notes WHERE reminder_id = ?;`,
    [reminderId]
  );
  return notes;
};

// Function to fetch all notes for a specific notification
export const fetchNotesForNotification = async (notificationId: number): Promise<any[]> => {
  const db = await openDB();
  const notes = await db.getAllAsync(
    `SELECT * FROM notes WHERE notification_id = ?;`,
    [notificationId]
  );
  return notes;
};

////////// Functions for testing //////////

// Function to wipe the database and reinitialize it
// This is useful for development purposes or when you want to reset the database
// There is a button on the home page that calls this function
export const wipeDatabase = async () => {
  try {
    const db = await openDB();
    db.closeAsync();
    // Delete the database file
    await SQLite.deleteDatabaseAsync('reminders.db');
    console.log("✅ Database wiped successfully");
    // Reinitialize the database
    await initDatabase();
    console.log("✅ Database reinitialized successfully");
  } catch (error) {
    console.error("Error wiping database:", error);
  }
};