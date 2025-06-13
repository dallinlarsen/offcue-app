import * as SQLite from "expo-sqlite";
export const DB_FILENAME = "reminders.db";

const db = SQLite.openDatabaseSync(DB_FILENAME);
export default db;
