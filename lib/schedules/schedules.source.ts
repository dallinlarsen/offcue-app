import db from "../db";
import {
  convertIntegerValuesToBoolean,
  deleteFromTable,
  insertIntoTable,
  updateTable,
} from "../utils/db-helpers";
import { InsertSchedule, Schedule, ScheduleWithCount } from "./schedules.types";

export async function schedulesInit() {
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
    is_active INTEGER NOT NULL DEFAULT 1,     -- Active state of the schedule
    start_time TEXT NOT NULL,                 -- Start time of the schedule in HH:MM format
    end_time TEXT NOT NULL,                   -- End time of the schedule in HH:MM format
    created_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP || '+00:00'), -- The time the schedule was created
    updated_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP || '+00:00') -- The time the schedule was last updated
  );`);
  console.log("✅ Schedule table created successfully");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reminder_schedule (
    id INTEGER PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL,             -- Foreign key to reminders table
    schedule_id INTEGER NOT NULL,             -- Foreign key to schedule table
    created_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP || '+00:00'), -- The time the reminder schedule was created
    updated_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP || '+00:00'), -- The time the reminder schedule was last updated
    FOREIGN KEY (reminder_id) REFERENCES reminders (id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules (id) ON DELETE CASCADE
  );`);
  console.log("✅ Reminder schedule table created successfully");
}

// Get
export async function getAllSchedules() {
  const schedules = await db.getAllAsync<ScheduleWithCount>(
    `SELECT s.*, COUNT(rs.id) AS reminder_count 
     FROM schedules s
     LEFT JOIN reminder_schedule rs ON rs.schedule_id = s.id
     GROUP BY s.id
     ORDER BY COUNT(rs.id) DESC, label;`,
    []
  );

  return schedules.map((s) =>
    convertIntegerValuesToBoolean(s, [
      "is_active",
      "is_sunday",
      "is_monday",
      "is_tuesday",
      "is_wednesday",
      "is_thursday",
      "is_friday",
      "is_saturday",
    ])
  );
}

export async function getAllSchedulesAlphabetical() {
  const schedules = await db.getAllAsync<ScheduleWithCount>(
    `SELECT s.*, COUNT(rs.id) AS reminder_count 
     FROM schedules s
     LEFT JOIN reminder_schedule rs ON rs.schedule_id = s.id
     GROUP BY s.id
     ORDER BY label;`,
    []
  );

  return schedules.map((s) =>
    convertIntegerValuesToBoolean(s, [
      "is_active",
      "is_sunday",
      "is_monday",
      "is_tuesday",
      "is_wednesday",
      "is_thursday",
      "is_friday",
      "is_saturday",
    ])
  );
}

export async function getSchedule(id: number) {
  const schedule = await db.getFirstAsync<ScheduleWithCount>(
    `SELECT s.*, COUNT(rs.id) AS reminder_count 
     FROM schedules s
     LEFT JOIN reminder_schedule rs ON rs.schedule_id = s.id
     WHERE s.id = ?
     GROUP BY s.id;`,
    [id]
  );
  if (!schedule) return null;

  return convertIntegerValuesToBoolean(schedule, [
    "is_active",
    "is_sunday",
    "is_monday",
    "is_tuesday",
    "is_wednesday",
    "is_thursday",
    "is_friday",
    "is_saturday",
  ]);
}

export async function getSchedulesByReminderId(reminderId: number) {
  const schedules = await db.getAllAsync<Schedule>(
    `SELECT s.* 
     FROM schedules s
     JOIN reminder_schedule rs ON rs.schedule_id = s.id 
     WHERE rs.reminder_id = ?;`,
    [reminderId]
  );
  
  return schedules.map((s) =>
    convertIntegerValuesToBoolean(s, [
      "is_active",
      "is_sunday",
      "is_monday",
      "is_tuesday",
      "is_wednesday",
      "is_thursday",
      "is_friday",
      "is_saturday",
    ])
  );
}

export async function doesSameScheduleConfigurationExist(
  schedule: InsertSchedule
): Promise<number | null> {
  const trimmedLabel = schedule.label.trim();

  const result = await db.getFirstAsync<{
    id: number;
  }>(
    `SELECT id FROM schedules
     WHERE label = ?
       AND is_sunday = ?
       AND is_monday = ?
       AND is_tuesday = ?
       AND is_wednesday = ?
       AND is_thursday = ?
       AND is_friday = ?
       AND is_saturday = ?
       AND start_time = ?
       AND end_time = ?
     LIMIT 1`,
    [
      trimmedLabel,
      schedule.is_sunday,
      schedule.is_monday,
      schedule.is_tuesday,
      schedule.is_wednesday,
      schedule.is_thursday,
      schedule.is_friday,
      schedule.is_saturday,
      schedule.start_time,
      schedule.end_time,
    ]
  );

  return result?.id ?? null;
}

// Create
export async function createSchedule(model: InsertSchedule) {
  return await insertIntoTable("schedules", { ...model, label: model.label.trim() });
}

export async function createScheduleReminderMaps(
  reminder_id: number,
  scheduleIds: number[]
) {
  for (const schedule_id of scheduleIds) {
    await insertIntoTable("reminder_schedule", { reminder_id, schedule_id });
  }
}

export async function createInitialSchedules() {
  const schedules = await getAllSchedules();

  if (schedules.length === 0) {
    // Add a few example schedules to the database
    const exampleSchedules = [
      {
        label: "Awake",
        is_sunday: true,
        is_monday: true,
        is_tuesday: true,
        is_wednesday: true,
        is_thursday: true,
        is_friday: true,
        is_saturday: true,
        is_active: true,
        start_time: "07:00",
        end_time: "21:00",
      },
      {
        label: "Evening Routine",
        is_sunday: false,
        is_monday: true,
        is_tuesday: true,
        is_wednesday: true,
        is_thursday: true,
        is_friday: true,
        is_saturday: false,
        is_active: true,
        start_time: "18:00",
        end_time: "21:00",
      },
      {
        label: "Weekend Recharge",
        is_sunday: true,
        is_monday: false,
        is_tuesday: false,
        is_wednesday: false,
        is_thursday: false,
        is_friday: false,
        is_saturday: true,
        is_active: true,
        start_time: "10:00",
        end_time: "18:00",
      },
      {
        label: "Work",
        is_sunday: false,
        is_monday: true,
        is_tuesday: true,
        is_wednesday: true,
        is_thursday: true,
        is_friday: true,
        is_saturday: false,
        is_active: true,
        start_time: "08:00",
        end_time: "17:00",
      },
      {
        label: "Early Morning Focus",
        is_sunday: false,
        is_monday: true,
        is_tuesday: true,
        is_wednesday: true,
        is_thursday: true,
        is_friday: true,
        is_saturday: false,
        is_active: true,
        start_time: "05:30",
        end_time: "08:00",
      },
      {
        label: "Afternoon Deep Work",
        is_sunday: false,
        is_monday: true,
        is_tuesday: false,
        is_wednesday: true,
        is_thursday: false,
        is_friday: true,
        is_saturday: false,
        is_active: true,
        start_time: "13:00",
        end_time: "16:00",
      },
      {
        label: "Creative Block",
        is_sunday: false,
        is_monday: false,
        is_tuesday: true,
        is_wednesday: false,
        is_thursday: true,
        is_friday: false,
        is_saturday: false,
        is_active: true,
        start_time: "19:00",
        end_time: "22:00",
      },
      {
        label: "Sunday Reset",
        is_sunday: true,
        is_monday: false,
        is_tuesday: false,
        is_wednesday: false,
        is_thursday: false,
        is_friday: false,
        is_saturday: false,
        is_active: true,
        start_time: "15:00",
        end_time: "18:00",
      },
      {
        label: "Saturday Adventure",
        is_sunday: false,
        is_monday: false,
        is_tuesday: false,
        is_wednesday: false,
        is_thursday: false,
        is_friday: false,
        is_saturday: true,
        is_active: true,
        start_time: "08:00",
        end_time: "14:00",
      },
      {
        label: "Exercise",
        is_sunday: false,
        is_monday: true,
        is_tuesday: false,
        is_wednesday: true,
        is_thursday: false,
        is_friday: true,
        is_saturday: false,
        is_active: true,
        start_time: "17:00",
        end_time: "19:00",
      },
      {
        label: "Wind Down",
        is_sunday: true,
        is_monday: true,
        is_tuesday: true,
        is_wednesday: true,
        is_thursday: true,
        is_friday: true,
        is_saturday: true,
        is_active: true,
        start_time: "21:00",
        end_time: "23:30",
      },
    ];
    for (const schedule of exampleSchedules) {
      await createSchedule(schedule);
    }
  }
  console.log("✅ Example schedules added successfully");
}

// Update
export async function updateSchedule(id: number, model: Partial<Schedule>) {
  let labelTrimObject = {};
  if (Object.keys(model).includes('label')) {
    labelTrimObject = { label: model.label?.trim() }
  }

  return await updateTable(
    "schedules",
    { ...model, ...labelTrimObject },
    { id }
  );
}

// Delete
export async function deleteSchedule(id: number) {
  return await deleteFromTable("schedules", { id });
}

export async function deleteReminderScheduleMap(id: number) {
  return await deleteFromTable("reminder_schedule", { id });
}

export async function deleteReminderScheduleMapByReminderId(
  reminderId: number
) {
  return await deleteFromTable("reminder_schedule", {
    reminder_id: reminderId,
  });
}

export async function deleteReminderScheduleMapByReminderIdAndScheduleId(
  reminderId: number,
  scheduleId: number
) {
  return await deleteFromTable("reminder_schedule", {
    reminder_id: reminderId,
    schedule_id: scheduleId,
  });
}
