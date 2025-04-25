import db from "../db";
import { deleteFromTable, insertIntoTable, updateTable } from "../utils/db-helpers";
import { InsertSchedule, Schedule } from "./schedules.types";

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
    start_time TEXT NOT NULL,                 -- Start time of the schedule in HH:MM format
    end_time TEXT NOT NULL,                   -- End time of the schedule in HH:MM format
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the schedule was created
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP -- The time the schedule was last updated
  );`);
  console.log("✅ Schedule table created successfully");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reminder_schedule (
    id INTEGER PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL,             -- Foreign key to reminders table
    schedule_id INTEGER NOT NULL,             -- Foreign key to schedule table
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the reminder schedule was created
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the reminder schedule was last updated
    FOREIGN KEY (reminder_id) REFERENCES reminders (id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules (id) ON DELETE CASCADE
  );`);
  console.log("✅ Reminder schedule table created successfully");
}

// Get 
export async function getAllSchedules() {
  return await db.getAllAsync<Schedule>(
    `SELECT * FROM schedules ORDER BY label;`,
    []
  );
};

export async function getSchedule(id: number) {
  const schedule = await db.getFirstAsync<Schedule>(
    `SELECT * FROM schedules WHERE id = ?;`,
    [id]
  );
  return schedule;
};

export async function getSchedulesByReminderId(reminderId: number) {
  const schedule = await db.getAllAsync<Schedule>(
    `SELECT s.* 
     FROM schedules s
     JOIN reminder_schedule rs ON rs.schedule_id = s.id 
     WHERE rs.reminder_id = ?;`,
    [reminderId]
  );
  return schedule;
};

// Create
export async function createSchedule(model: InsertSchedule) {
  return await insertIntoTable("schedules", model);
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
        label: "Work",
        is_sunday: false,
        is_monday: true,
        is_tuesday: true,
        is_wednesday: true,
        is_thursday: true,
        is_friday: true,
        is_saturday: false,
        start_time: "08:00",
        end_time: "17:00",
      },
      {
        label: "Evening",
        is_sunday: false,
        is_monday: true,
        is_tuesday: true,
        is_wednesday: true,
        is_thursday: true,
        is_friday: true,
        is_saturday: false,
        start_time: "18:00",
        end_time: "20:00",
      },
      {
        label: "Weekend",
        is_sunday: true,
        is_monday: false,
        is_tuesday: false,
        is_wednesday: false,
        is_thursday: false,
        is_friday: false,
        is_saturday: true,
        start_time: "10:00",
        end_time: "18:00",
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
  return await updateTable("schedules", model, { id });
}


// Delete
export async function deleteSchedule(id: number) {
  return await deleteFromTable("schedules", { id });
}

export async function deleteReminderScheduleMap(id: number) {
  return await deleteFromTable("reminder_schedule", { id });
}

export async function deleteReminderScheduleMapByReminderId(reminderId: number) {
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
