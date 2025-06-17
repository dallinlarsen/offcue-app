import db from "../db";
import { NReminder } from "../reminders/reminders.types";
import {
  deleteFromTable,
  insertIntoTable,
  updateTable,
  ensureUtcOffset,
} from "../utils/db-helpers";
import { InsertRNotification, RNotification } from "./notifications.types";
import { AMOUNT_TO_SCHEDULE } from "./notifications.constants";

export async function notificationsInit() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY NOT NULL,
        reminder_id INTEGER NOT NULL,             -- Foreign key to reminders table
        scheduled_at DATETIME NOT NULL,           -- The time the notification is scheduled for
        interval_index INTEGER NOT NULL,          -- The index of the interval for the notification
        segment_index INTEGER NOT NULL,           -- The index of the segment for the notification
        response_at DATETIME,                     -- The time the user responded to the notification
        response_status TEXT,                     -- The status of the user's response (e.g., "done", "skipped")
        created_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP || '+00:00'), -- The time the notification was created
        updated_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP || '+00:00'), -- The time the notification was last updated
        FOREIGN KEY (reminder_id) REFERENCES reminders (id) ON DELETE CASCADE

        UNIQUE (reminder_id, interval_index, segment_index)
    );
  `);

  await ensureUtcOffset('notifications', [
    'scheduled_at',
    'response_at',
    'created_at',
    'updated_at',
  ]);

  console.log("✅ Notifications table created successfully");
}

// Get
export async function getNotification(id: number) {
  const notification = await db.getFirstAsync<RNotification>(
    `SELECT * FROM notifications WHERE id = ?;`,
    [id]
  );
  return notification;
}

export async function getPastNotificationsByReminderId(
  reminderId: number,
  limit?: number,
  offset?: number
) {
  const notifications = await db.getAllAsync<RNotification>(
    `
    SELECT * 
    FROM notifications 
    WHERE reminder_id = ? 
      AND scheduled_at < CURRENT_TIMESTAMP 
      AND response_status IS NOT NULL
    ORDER BY scheduled_at DESC
    ${limit ? "LIMIT = ?" : ""} ${limit && offset ? "OFFSET = ?" : ""};`,
    [reminderId, limit || null, offset || null]
  );
  return notifications;
}

export async function getFutureNotificationsByReminderId(reminderId: number) {
  const notifications = await db.getAllAsync<RNotification>(
    `SELECT * 
     FROM notifications 
     WHERE reminder_id = ? 
       AND response_at IS NULL 
       AND scheduled_at > CURRENT_TIMESTAMP;`,
    [reminderId]
  );
  return notifications;
}

export async function getSoonestFutureNotificationsToSchedule(
  amount: number = AMOUNT_TO_SCHEDULE
) {
  const notifications = await db.getAllAsync<RNotification & NReminder>(
    `SELECT n.*,
            r.title,
            r.description,
            r.interval_type,
            r.interval_num,
            r.times,
            r.is_recurring
     FROM notifications n
     JOIN reminders r ON r.id = n.reminder_id
     WHERE response_at IS NULL AND scheduled_at > CURRENT_TIMESTAMP
     ORDER BY scheduled_at
     LIMIT ?;`,
    [amount]
  );
  return notifications.map((n) => ({
    ...n,
    is_recurring: n.is_recurring === (1 as unknown as boolean),
  }));
}

export async function getNextNotificationByReminderId(reminderId: number) {
  const notification = await db.getFirstAsync<RNotification>(
    `SELECT * 
     FROM notifications 
     WHERE reminder_id = ? 
     ORDER BY interval_index ASC, segment_index ASC;`,
    [reminderId]
  );

  return notification;
}

export async function getNextUpcomingNotificationByReminderId(
  reminderId: number
) {
  const notification = await db.getFirstAsync<RNotification>(
    `SELECT * 
     FROM notifications 
     WHERE reminder_id = ? 
       AND response_status IS NULL 
     ORDER BY scheduled_at ASC;`,
    [reminderId]
  );
  return notification;
}

export async function getUnrespondedNotificationsByReminderId(
  reminderId: number
) {
  const notifications = await db.getAllAsync<RNotification>(
    `SELECT * 
     FROM notifications 
     WHERE reminder_id = ? 
       AND response_status IS NULL;`,
    [reminderId]
  );
  return notifications;
}

export async function getLastDoneNotificationByReminderId(reminderId: number) {
  const notification = await db.getFirstAsync<RNotification>(
    ` SELECT * 
      FROM notifications 
      WHERE reminder_id = ? AND response_status = 'done'
      ORDER BY scheduled_at DESC
      LIMIT 1;`,
    [reminderId]
  );
  return notification;
}

// Create
export async function createNotification(model: InsertRNotification) {
  return await insertIntoTable("notifications", model);
}

// Update
export async function updateNotification(
  id: number,
  model: Partial<RNotification>
) {
  return await updateTable("notifications", model, { id });
}

export async function updateAllPastDueNotificationsToNoReponseByReminderId(reminderId: number) {
  // Set all the notifications that were no_response to no_response.
  await db.runAsync(
    ` UPDATE notifications
      SET response_at = CURRENT_TIMESTAMP || '+00:00',
          response_status = 'no_response',
          updated_at = CURRENT_TIMESTAMP || '+00:00'
      WHERE scheduled_at <= CURRENT_TIMESTAMP
        AND response_status IS NULL
        AND reminder_id = ?;`,
    [reminderId]
  );
}

// Delete
export async function deleteNotification(id: number) {
  return await deleteFromTable("notifications", { id });
}

export async function deleteNotificationsByReminderId(reminderId: number) {
  return await deleteFromTable("notifications", { reminder_id: reminderId });
}

export async function deleteFutureNotificationsByReminderId(
  reminderId: number
) {
  await db.runAsync(
    `DELETE FROM notifications 
     WHERE reminder_id = ? 
       AND response_at IS NULL 
       AND scheduled_at > CURRENT_TIMESTAMP;`,
    [reminderId]
  );
}

/**
 * Delete unresponded notifications scheduled after a specific cutoff datetime.
 */
export async function deleteNotificationsAfterDate(
  reminderId: number,
  cutoff: string
): Promise<void> {
  await db.runAsync(
    `DELETE FROM notifications
     WHERE reminder_id = ?
       AND response_at IS NULL
       AND scheduled_at > ?;`,
    [reminderId, cutoff]
  );
}

export async function deleteNotificationsInInterval(
  reminder_id: number,
  interval_index: number
) {
  return await deleteFromTable("notifications", {
    reminder_id,
    interval_index,
  });
}

export function getActiveReminderCounts() {
  throw new Error("Function not implemented.");
}
