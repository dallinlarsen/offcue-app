import { db } from "../db";
import {
  deleteFromTable,
  insertIntoTable,
  updateTable,
} from "../utils/db-helpers";
import {
  InsertReminder,
  Reminder,
  ReminderBase,
  ReminderBooleanColumn,
} from "./reminders.types";

export async function remindersInit() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,                            -- Required title of the reminder
    description TEXT,                               -- Optional description of the reminder
    interval_type TEXT NOT NULL,                    -- The type of interval (e.g., "minute", "hour", "day", "week", "month", "year")
    interval_num INTEGER NOT NULL,                  -- The length of the interval (e.g., number of minutes, hours, days, etc.)
    times INTEGER NOT NULL,                         -- The number of times the reminder should occur in the defined interval
    track_streak INTEGER NOT NULL DEFAULT 0,        -- Whether to track streaks (1 for true, 0 for false)
    track_notes INTEGER NOT NULL DEFAULT 0,         -- Whether to track notes (1 for true, 0 for false)
    is_muted INTEGER NOT NULL DEFAULT 0,            -- Whether the reminder is muted (1 for true, 0 for false)
    is_recurring INTEGER NOT NULL DEFAULT 1,        -- Whether the reminder is recurring (1 for true, 0 for false)
    is_archived INTEGER NOT NULL DEFAULT 0,         -- Whether the reminder is archived (1 for true, 0 for false)
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- When the reminder begins reminding 
    end_date DATE,                                  -- When the reminder is auto archived
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the reminder was created
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- The time the reminder was last updated
  );`);
  console.log("✅ Reminders table created successfully");
}

// Get
export async function getReminderOrGetReminders(
  id?: number,
  limit?: number,
  offset?: number,
  wherePositive: ReminderBooleanColumn[] = [],
  whereNegative: ReminderBooleanColumn[] = [],
  orderByScheduledAt: 'ASC' | 'DESC' = 'ASC',
) {
  if (
    id &&
    (limit || offset || wherePositive.length > 0 || whereNegative.length > 0)
  ) {
    throw new Error(
      'If "id" is passed to "getReminderOrGetReminders" no other value can be passed.'
    );
  }

  const reminders = await db.getAllAsync<Reminder>(
    `
  WITH RECURSIVE done_streaks AS (
  -- Base case: latest 'done' notification with no later non-'done' responses
  SELECT
    n.reminder_id,
    n.id,
    n.scheduled_at,
    n.response_status,
    1 AS streak
  FROM notifications n
  WHERE n.response_status = 'done'
    AND n.scheduled_at <= CURRENT_TIMESTAMP
    AND NOT EXISTS (
      SELECT 1
      FROM notifications nx
      WHERE nx.reminder_id = n.reminder_id
        AND nx.scheduled_at > n.scheduled_at
        AND nx.response_status IS NOT NULL
        AND nx.response_status IS NOT 'done'
    )

  UNION ALL

  -- Recursive step: go backwards as long as they're 'done' and not broken by non-'done'
  SELECT
    n.reminder_id,
    n.id,
    n.scheduled_at,
    n.response_status,
    ds.streak + 1
  FROM notifications n
  JOIN done_streaks ds ON n.reminder_id = ds.reminder_id
  WHERE n.response_status = 'done'
    AND n.scheduled_at <= CURRENT_TIMESTAMP
    AND n.scheduled_at < ds.scheduled_at
    AND NOT EXISTS (
      SELECT 1
      FROM notifications nx
      WHERE nx.reminder_id = n.reminder_id
        AND nx.scheduled_at > n.scheduled_at
        AND nx.scheduled_at < ds.scheduled_at
        AND nx.response_status IS NOT NULL
        AND nx.response_status IS NOT 'done'
    )
  ),
  max_streaks AS (
    SELECT reminder_id, MAX(streak) AS current_streak
    FROM done_streaks
    GROUP BY reminder_id
  ),
  latest_notifications AS (
    SELECT n.*,
          ROW_NUMBER() OVER (PARTITION BY reminder_id ORDER BY scheduled_at DESC) AS rn
    FROM notifications n
    WHERE scheduled_at <= CURRENT_TIMESTAMP
      AND response_at IS NULL
  ),
  future_notifications AS (
    SELECT n.*,
          ROW_NUMBER() OVER (PARTITION BY reminder_id ORDER BY scheduled_at) AS rn
    FROM notifications n
    WHERE scheduled_at > CURRENT_TIMESTAMP
      AND response_at IS NULL
  )
  SELECT  
    r.*,
    COALESCE(ms.current_streak, 0) AS current_streak,
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
    ) AS schedules,
    ln.scheduled_at AS due_scheduled_at,
    ln.id AS due_notification_id,
    fn.scheduled_at AS future_scheduled_at,
    n.id IS NOT NULL AS is_completed,
    n.response_at AS completed_at
  FROM reminders r
  JOIN reminder_schedule rs ON rs.reminder_id = r.id
  JOIN schedules s ON s.id = rs.schedule_id
  LEFT JOIN notifications n ON n.reminder_id = r.id AND NOT r.is_recurring AND n.response_status = 'done'
  LEFT JOIN max_streaks ms ON ms.reminder_id = r.id
  LEFT JOIN (
    SELECT * FROM latest_notifications
    WHERE rn = 1
  ) ln ON ln.reminder_id = r.id
  LEFT JOIN (
    SELECT * FROM future_notifications
    WHERE rn = 1
  ) fn ON fn.reminder_id = r.id
  WHERE TRUE ${id ? "AND r.id = ?" : ""}
  ${wherePositive.length > 0 ? "AND " + wherePositive.join(" AND ") : ""}
  ${
    whereNegative.length > 0 ? "AND NOT " + whereNegative.join(" AND NOT ") : ""
    }
  GROUP BY r.id
  ORDER BY due_scheduled_at DESC, fn.scheduled_at ${orderByScheduledAt}
  ${limit ? "LIMIT = ?" : ""} ${limit && offset ? "OFFSET = ?" : ""};
  `,
    [id || null, limit || null, offset || null].filter((i) => i !== null)
  );

  return reminders.map((r) => ({
    ...r,
    track_streak: r.track_streak === (1 as unknown as boolean),
    is_muted: r.is_muted === (1 as unknown as boolean),
    is_recurring: r.is_recurring === (1 as unknown as boolean),
    is_completed: r.is_completed === (1 as unknown as boolean),
    is_archived: r.is_archived === (1 as unknown as boolean),
    schedules: JSON.parse(r.schedules as unknown as string),
    current_streak: r.current_streak ?? 0,
  }));
}

/**
 * Fetch active reminders: not muted, not archived, and either recurring
 * or (if non-recurring) have no 'done' notification (i.e., still active).
 */
export async function getActiveReminders() {
  const reminders = await db.getAllAsync<ReminderBase>(
    `
    SELECT
      r.*,
      n.id IS NOT NULL AS is_completed,
      n.response_at AS completed_at
    FROM reminders r
    LEFT JOIN notifications n
      ON n.reminder_id = r.id
      AND NOT r.is_recurring
      AND n.response_status = 'done'
    WHERE
      r.is_muted = 0
      AND r.is_archived = 0
      AND (
        r.is_recurring = 1
        OR NOT EXISTS (
          SELECT 1
          FROM notifications nx
          WHERE nx.reminder_id = r.id
            AND nx.response_status = 'done'
        )
      );
    `
  );

  return reminders.map((r) => ({
    ...r,
    track_streak: r.track_streak === (1 as unknown as boolean),
    is_muted: r.is_muted === (1 as unknown as boolean),
    is_recurring: r.is_recurring === (1 as unknown as boolean),
    is_completed: r.is_completed === (1 as unknown as boolean),
    is_archived: r.is_archived === (1 as unknown as boolean),
  }));
}

export async function getRemindersByScheduleId(scheduleId: number) {
  return await db.getAllAsync<ReminderBase>(
    `SELECT r.*, n.id IS NOT NULL AS is_completed, n.response_at AS completed_at
     FROM reminders r
     JOIN reminder_schedule rs ON rs.reminder_id = r.id
     LEFT JOIN notifications n ON n.reminder_id = r.id AND NOT r.is_recurring AND n.response_status = 'done' 
     WHERE rs.schedule_id = ?;`,
    [scheduleId]
  );
}

// Create
export async function createReminder(model: InsertReminder) {
  return await insertIntoTable("reminders", model);
}

// Update
export async function updateReminder(id: number, model: Partial<ReminderBase>) {
  return await updateTable("reminders", model, { id });
}

// Delete
export async function deleteReminder(id: number) {
  return await deleteFromTable("reminders", { id });
}
