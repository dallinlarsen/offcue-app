import * as SQLite from 'expo-sqlite';

export async function openDB() {
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

  await db.execAsync(`CREATE TABLE IF NOT EXISTS schedules (
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
    FOREIGN KEY (schedule_id) REFERENCES schedules (id) ON DELETE CASCADE
  );`);
  console.log("✅ Reminder schedule table created successfully");
};

/////////////////////////////////////////
////////// CRUD for reminders //////////
///////////////////////////////////////

// Function to save a reminder
export const createReminder = async (
  title: string,
  description: string,
  intervalType: string,
  intervalNum: number,
  times: number,
  scheduleIds: number[],
  trackStreak: boolean,
  trackNotes: boolean,
  muted: boolean
): Promise<number> => {
  const db = await openDB();
  const result = await db.runAsync(
    `INSERT INTO reminders (title, description, interval_type, interval_num, times, track_streak, track_notes, is_muted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [title, description, intervalType, intervalNum, times, trackStreak ? 1 : 0, trackNotes ? 1 : 0, muted ? 1 : 0]
  );
  console.log("✅ Reminder saved successfully", result);

  const reminder_id = result.lastInsertRowId;

  for (const schedule_id of scheduleIds) {
    await db.runAsync(
      `INSERT INTO reminder_schedule (reminder_id, schedule_id)
      VALUES (?, ?);`,
      [reminder_id, schedule_id]
    );
  }

  return result.lastInsertRowId;
};

// function to fetch a specific reminder by ID
export const getReminder = async (id: number): Promise<any> => {
  const db = await openDB();
  const reminder = await db.getFirstAsync(`
    SELECT  r.*,
            json_group_array(
              json_object(
                'id', s.id, 
                'label', s.label,
                'is_sunday', s.is_sunday,
                'is_monday', s.is_monday,
                'is_tuesday', s.is_tuesday,
                'is_wednesday', s.is_wednesday,
                'is_thursday', s.is_thursday,
                'is_friday', s.is_friday,
                'is_saturday', s.is_saturday,
                'start_time', s.start_time,
                'end_time', s.end_time
              )
            ) AS schedules
    FROM reminders r
    JOIN reminder_schedule rs ON rs.reminder_id = r.id
    JOIN schedules s ON s.id = rs.schedule_id
    WHERE r.id = ?
    GROUP BY r.id;
    `,
    [id]
  );

  return reminder;
};

// Function to update a reminder
export const updateReminder = async (
  id: number,
  title: string,
  description: string,
  intervalType: string,
  intervalNum: number,
  times: number,
  trackStreak: boolean,
  trackNotes: boolean,
  isMuted: boolean
): Promise<void> => {
  const db = await openDB();
  await db.runAsync(
    `UPDATE reminders 
     SET title = ?, description = ?, interval_type = ?, interval_num = ?, times = ?, track_streak = ?, track_notes = ?, is_muted = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?;`,
    [title, description, intervalType, intervalNum, times, trackStreak ? 1 : 0, trackNotes ? 1 : 0, isMuted ? 1 : 0, id]
  );
  console.log("✅ Reminder updated successfully");
};

// Function to update the muted status of a reminder
export const updateReminderMuted = async (id: number, isMuted: boolean): Promise<void> => {
  const db = await openDB();
  await db.runAsync(
    `UPDATE reminders
     SET is_muted = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?;`,
    [isMuted ? 1 : 0, id]
  );
  console.log("✅ Reminder muted status updated successfully");
};

// Function to delete a reminder
export const deleteReminder = async (id: number): Promise<void> => {
  const db = await openDB();
  await db.runAsync(`DELETE FROM reminders WHERE id = ?;`, [id]);
  console.log("✅ Reminder deleted successfully");
};

/////////////////////////////////////////////
////////// CRUD for notifications //////////
///////////////////////////////////////////

// Function to save a notification
export const createNotification = async (
  reminderId: number,
  scheduledAt: string,
  isScheduled: boolean,
  intervalIndex: number,
  segmentIndex: number
): Promise<number> => {
  const db = await openDB();
  const result = await db.runAsync(
    `INSERT INTO notifications (reminder_id, scheduled_at, is_scheduled, interval_index, segment_index)
     VALUES (?, ?, ?, ?, ?);`,
    [reminderId, scheduledAt, isScheduled ? 1 : 0, intervalIndex, segmentIndex]
  );
  console.log("✅ Notification saved successfully", result);

  return result.lastInsertRowId;
};

// Function to fetch a specific notification by ID
export const getNotification = async (id: number): Promise<any> => {
  const db = await openDB();
  const notification = await db.getFirstAsync(`SELECT * FROM notifications WHERE id = ?;`, [id]);
  return notification;
};

// Function to update a notification
export const updateNotification = async (
  id: number,
  scheduledAt: string,
  isScheduled: boolean,
  intervalIndex: number,
  segmentIndex: number,
  responseAt: string | null,
  responseStatus: string | null
): Promise<void> => {
  const db = await openDB();
  await db.runAsync(
    `UPDATE notifications
     SET scheduled_at = ?, is_scheduled = ?, interval_index = ?, segment_index = ?, response_at = ?, response_status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?;`,
    [scheduledAt, isScheduled ? 1 : 0, intervalIndex, segmentIndex, responseAt, responseStatus, id]
  );
  console.log("✅ Notification updated successfully");
};

// Function to delete a notification
export const deleteNotification = async (id: number): Promise<void> => {
  const db = await openDB();
  await db.runAsync(`DELETE FROM notifications WHERE id = ?;`, [id]);
  console.log("✅ Notification deleted successfully");
};

/////////////////////////////////////
////////// CRUD for Notes //////////
///////////////////////////////////

// TODO: Will implement notes later
// It is not in our MVP

/////////////////////////////////////////
////////// CRUD for schedules //////////
///////////////////////////////////////

// Function to save a schedule
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
): Promise<number> => {
  const db = await openDB();
  const result = await db.runAsync(
    `INSERT INTO schedules (label, is_sunday, is_monday, is_tuesday, is_wednesday, is_thursday, is_friday, is_saturday, start_time, end_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      label,
      isSunday ? 1 : 0,
      isMonday ? 1 : 0,
      isTuesday ? 1 : 0,
      isWednesday ? 1 : 0,
      isThursday ? 1 : 0,
      isFriday ? 1 : 0,
      isSaturday ? 1 : 0,
      startTime,
      endTime
    ]
  );
  console.log("✅ Schedule saved successfully", result);
  return result.lastInsertRowId;
};

// Function to fetch a schedule
export const getSchedule = async (id: number): Promise<any> => {
  const db = await openDB();
  const schedule = await db.getFirstAsync(`SELECT * FROM schedules WHERE id = ?;`, [id]);
  return schedule;
};

// Function to update a schedule
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
): Promise<void> => {
  const db = await openDB();
  await db.runAsync(
    `UPDATE schedules
     SET label = ?, is_sunday = ?, is_monday = ?, is_tuesday = ?, is_wednesday = ?, is_thursday = ?, is_friday = ?, is_saturday = ?, start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?;`,
    [
      label,
      isSunday ? 1 : 0,
      isMonday ? 1 : 0,
      isTuesday ? 1 : 0,
      isWednesday ? 1 : 0,
      isThursday ? 1 : 0,
      isFriday ? 1 : 0,
      isSaturday ? 1 : 0,
      startTime,
      endTime,
      id
    ]
  );
  console.log("✅ Schedule updated successfully");
}

// Function to delete a schedule
export const deleteSchedule = async (id: number): Promise<void> => {
  const db = await openDB();
  await db.runAsync(`DELETE FROM schedules WHERE id = ?;`, [id]);
  console.log("✅ Schedule deleted successfully");
};

//////////////////////////////////////////////////
////////// CRUD for reminder_schedules //////////
////////////////////////////////////////////////

// Function to save a reminder schedule
export const createReminderSchedule = async (
  reminderId: number,
  scheduleId: number
): Promise<number> => {
  const db = await openDB();
  const result = await db.runAsync(
    `INSERT INTO reminder_schedule (reminder_id, schedule_id, created_at, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    [reminderId, scheduleId]
  );
  console.log("✅ Reminder schedule saved successfully", result);
  return result.lastInsertRowId;
};

// Function to delete a reminder schedule
export const deleteReminderSchedule = async (id: number): Promise<void> => {
  const db = await openDB();
  await db.runAsync(`DELETE FROM reminder_schedule WHERE id = ?;`, [id]);
  console.log("✅ Reminder schedule deleted successfully");
};

///////////////////////////////////////
////////// Get All Entities //////////
/////////////////////////////////////

// Function to fetch all reminders
export const getAllReminders = async (): Promise<any[]> => {
  const db = await openDB();
  const reminders = await db.getAllAsync(`
    SELECT  r.*,
            json_group_array(
              json_object(
                'id', s.id, 
                'label', s.label,
                'is_sunday', s.is_sunday,
                'is_monday', s.is_monday,
                'is_tuesday', s.is_tuesday,
                'is_wednesday', s.is_wednesday,
                'is_thursday', s.is_thursday,
                'is_friday', s.is_friday,
                'is_saturday', s.is_saturday,
                'start_time', s.start_time,
                'end_time', s.end_time
              )
            ) AS schedules
    FROM reminders r
    JOIN reminder_schedule rs ON rs.reminder_id = r.id
    JOIN schedules s ON s.id = rs.schedule_id
    GROUP BY r.id;
  `, []);

  return reminders.map(r => ({ ...r, schedules: JSON.parse(r.schedules) }));
};

// Function to fetch all schedules
export const getAllSchedules = async (): Promise<any[]> => {
  const db = await openDB();
  const schedules = await db.getAllAsync(`SELECT * FROM schedules;`, []);
  return schedules;
};

////////////////////////////////////////////////////
////////// Get All Entities For Reminder //////////
//////////////////////////////////////////////////

// Function to fetch all notifications for a specific reminder
export const getReminderNotifications = async (reminderId: number): Promise<any[]> => {
  const db = await openDB();
  const notifications = await db.getAllAsync(
    `SELECT * FROM notifications WHERE reminder_id = ?;`,
    [reminderId]
  );
  return notifications;
};

// Function to fetch all notifications that have no response
export const getUnrespondedReminderNotifications = async (reminderId: number): Promise<any[]> => {
  const db = await openDB();
  const notifications = await db.getAllAsync(
    `SELECT * FROM notifications WHERE reminder_id = ? AND response_status IS NULL;`,
    [reminderId]
  );
  return notifications;
};

// Helper function to get schedules for a given reminder
export const getReminderSchedules = async (reminderId: number): Promise<any[]> => {
  const db = await openDB();
  // Join the reminder_schedule table with the schedule table to get the schedule details
  const schedules = await db.getAllAsync(
    `SELECT s.* FROM schedules s 
     INNER JOIN reminder_schedule rs ON rs.schedule_id = s.id 
     WHERE rs.reminder_id = ?;`,
    [reminderId]
  );
  return schedules;
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

// Helper function return all notifications given a specific interval_index
export const getNotificationsByInterval = async (reminderId: number, intervalIndex: number): Promise<any[]> => {
  const db = await openDB();
  const notifications = await db.getAllAsync(
    `SELECT * FROM notifications WHERE reminder_id = ? AND interval_index = ?;`,
    [reminderId, intervalIndex]
  );
  return notifications;
};

////////////////////////////////////////////
////////// Functions for testing //////////
//////////////////////////////////////////

// Function to wipe the database and reinitialize it
export const wipeDatabase = async (): Promise<void> => {
  try {
    const db = await openDB();
    db.closeAsync();
    // Delete the database file
    await SQLite.deleteDatabaseAsync('reminders.db');
    console.log("✅ Database wiped successfully");
  } catch (error) {
    console.error("Error wiping database:", error);
  }
  // Reinitialize the database
  await initDatabase();
  console.log("✅ Database reinitialized successfully");
}