import { Settings } from "./settings.types";
import db from "../db";
import {
  convertIntegerValuesToBoolean,
  updateTable,
} from "../utils/db-helpers";

export async function settingsInit() {
  await db.execAsync(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY NOT NULL,
    has_completed_tutorial INTEGER NOT NULL DEFAULT 0,      -- Whether the user has completed the tutorial (1 for true, 0 for false)
    notification_sound TEXT,                                -- The sound to play for notifications
    notification_vibration INTEGER NOT NULL DEFAULT 1,      -- Whether to vibrate for notifications (1 for true, 0 for false)
    theme TEXT NOT NULL DEFAULT 'system',                    -- The theme of the app (e.g., "light", "dark", "system")
    language TEXT NOT NULL DEFAULT 'en',                    -- The language of the app (e.g., "en", "es", "fr")
    timezone TEXT NOT NULL DEFAULT 'UTC',                   -- The timezone of the user
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- The time the user settings were created
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- The time the user settings were last updated
  );`);

  const userSettings = await getSettings();

  if (!userSettings?.id) {
    await db.runAsync(
      `INSERT INTO settings (has_completed_tutorial) VALUES (0);`
    );
  }
  console.log("✅ Settings table created successfully");
}

// Get
export const getSettings = async () => {
  const result = await db.getFirstAsync<Settings>(
    `SELECT *
     FROM settings;`
  );

  if (!result) return null;
  return convertIntegerValuesToBoolean(result, [
    "has_completed_tutorial",
    "notification_sound",
    "notification_vibration",
  ]);
};

// Update
export async function updateSettings(model: Partial<Settings>) {
  const settings = await getSettings();

  if (settings) {
    return await updateTable("settings", model, { id: settings.id });
  }
}
