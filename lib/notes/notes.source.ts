import db from "../db";
import { deleteFromTable, ensureUtcOffset } from "../utils/db-helpers";

export async function notesInit() {
  await db.execAsync(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL,   -- Foreign key to reminders table
    notification_id INTEGER,        -- Foreign key to notifications table if the note is related to a notification
    note TEXT NOT NULL,             -- The note text
    created_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP || '+00:00'), -- The time the note was created
    updated_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP || '+00:00'), -- The time the note was last updated
    FOREIGN KEY (reminder_id) REFERENCES reminders (id) ON DELETE CASCADE,
    FOREIGN KEY (notification_id) REFERENCES notifications (id) ON DELETE CASCADE
  );`);
  await ensureUtcOffset('notes', ['created_at', 'updated_at']);
  console.log("✅ Notes table created successfully");
}

export async function deleteNotesByReminderId(reminderId: number) {
  return await deleteFromTable("notes", { reminder_id: reminderId });
}