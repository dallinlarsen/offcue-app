import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("reminders.db");
export default db;
