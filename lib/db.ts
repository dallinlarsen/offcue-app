import * as SQLite from "expo-sqlite";

export let db = SQLite.openDatabaseSync("reminders.db");

export async function reopenDatabase() {
  try {
    await db.closeAsync();
  } catch {
    // ignore close errors
  }
  db = SQLite.openDatabaseSync("reminders.db");
}

export default db;
