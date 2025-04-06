import * as SQLite from 'expo-sqlite';

async function openDB() {
  return await SQLite.openDatabaseAsync('reminders.db');
}

export const initDatabase = async (): Promise<void> => {
  const db = await openDB();
  await db.execAsync(`CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    frequency INTEGER NOT NULL,
    frequencyType TEXT NOT NULL,
    times INTEGER NOT NULL,
    trackStreak INTEGER NOT NULL,
    muted INTEGER NOT NULL DEFAULT 0
  );`);
  console.log("✅ Reminders table created successfully");
};

export const saveReminder = async (
  title: string,
  description: string,
  frequency: number,
  frequencyType: string,
  times: number,
  trackStreak: boolean,
  muted: boolean // new parameter for mute state
): Promise<void> => {
  const db = await openDB();
  const result = await db.runAsync(
    `INSERT INTO reminders (title, description, frequency, frequencyType, times, trackStreak, muted)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [title, description, frequency, frequencyType, times, trackStreak ? 1 : 0, muted ? 1 : 0]
  );
  console.log("✅ Reminder saved successfully", result);
};

export const fetchReminders = async (): Promise<any[]> => {
  const db = await openDB();
  const reminders = await db.getAllAsync(`SELECT * FROM reminders;`, []);
  return reminders;
};

export const updateReminderMuted = async (id: number, muted: boolean): Promise<void> => {
  const db = await openDB();
  await db.runAsync(
    `UPDATE reminders SET muted = ? WHERE id = ?;`,
    [muted ? 1 : 0, id]
  );
  console.log("✅ Reminder muted state updated");
};

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