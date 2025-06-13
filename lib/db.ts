import * as SQLite from "expo-sqlite";
import { DB_FILENAME } from "./lib.constants";

const db = SQLite.openDatabaseSync(DB_FILENAME);
export default db;
