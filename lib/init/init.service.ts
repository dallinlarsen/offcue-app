import db, { DB_FILENAME } from "../db";
import * as SQLite from "expo-sqlite";
import { remindersInit } from "../reminders/reminders.service";
import { notesInit } from "../notes/notes.service";
import { notificationsInit } from "../notifications/notifications.service";
import { createInitialSchedules, schedulesInit } from "../schedules/schedules.service";
import { settingsInit } from "../settings/settings.service";

export async function initDatabase() {
    await remindersInit();
    await notificationsInit();
    await notesInit();
    await schedulesInit();
    await settingsInit();
    await createInitialSchedules();
}

export const wipeDatabase = async (): Promise<void> => {
  try {
    db.closeAsync();
    // Delete the database file
    await SQLite.deleteDatabaseAsync(DB_FILENAME);
    console.log("✅ Database wiped successfully");
  } catch (error) {
    console.error("Error wiping database:", error);
  }

  // Reinitialize the database
  await initDatabase();
  console.log("✅ Database reinitialized successfully");
};
