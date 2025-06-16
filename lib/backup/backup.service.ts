import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";
import db, { DB_FILENAME } from "../db";
import { BACKUP_FILENAME, SQLITE_DIR_NAME } from "./backup.constants";
import { runNotificationMaintenance } from "../notifications/notifications.service";
import { $reloadSettings } from "../settings/settings.store";

const DB_DIR = FileSystem.documentDirectory + SQLITE_DIR_NAME;
const DB_PATH = `${DB_DIR}/${DB_FILENAME}`;
const BACKUP_PATH = `${DB_DIR}/${BACKUP_FILENAME}`;

export const backupDatabase = async () => {
  const info = await FileSystem.getInfoAsync(DB_PATH);
  if (!info.exists) {
    Alert.alert("Error", "Database not found.");
    return;
  }

  try {
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );

    const data: Record<string, any[]> = {};
    for (const { name } of tables) {
      const rows = await db.getAllAsync<any>(`SELECT * FROM ${name};`);
      data[name] = rows;
    }

    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      data,
    };

    await FileSystem.writeAsStringAsync(
      BACKUP_PATH,
      JSON.stringify(backup)
    );

    await Sharing.shareAsync(BACKUP_PATH);
  } catch (e) {
    console.error("Error creating backup:", e);
    Alert.alert("Backup Failed", "Unable to create backup file.");
  }
};

export const restoreDatabase = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });

  if (result.canceled) return;

  const confirmed = await new Promise<boolean>((resolve) => {
    Alert.alert(
      "Restore Backup",
      "Restoring a backup will overwrite your current data. Continue?",
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Restore", style: "destructive", onPress: () => resolve(true) },
      ]
    );
  });

  if (!confirmed) return;

  const selectedUri = result.assets[0].uri;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const preRestoreBackupPath = `${DB_DIR}/reminders-backup-${timestamp}.db`;

  const currentExists = await FileSystem.getInfoAsync(DB_PATH);
  if (currentExists.exists) {
    await FileSystem.copyAsync({ from: DB_PATH, to: preRestoreBackupPath });
  }

  try {
    const jsonString = await FileSystem.readAsStringAsync(selectedUri);
    const backup = JSON.parse(jsonString);

    if (
      !backup ||
      backup.version !== 1 ||
      typeof backup.timestamp !== "string" ||
      typeof backup.data !== "object"
    ) {
      throw new Error("Invalid format");
    }

    for (const table of Object.keys(backup.data)) {
      const rows = backup.data[table];
      if (!Array.isArray(rows)) continue;

      // Clear existing data from the table to preserve the schema
      await db.runAsync(`DELETE FROM ${table};`);

      for (const row of rows) {
        const columns = Object.keys(row);
        const placeholders = columns.map(() => "?").join(", ");
        const values = columns.map((c) => row[c]);
        await db.runAsync(
          `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders});`,
          values
        );
      }
    }

    // Get the device and state of the app in sync after the new data is loaded.
    await runNotificationMaintenance();
    $reloadSettings.set(true);

    Alert.alert("Success", "Backup restored.");
  } catch (e) {
    console.error("Error restoring backup:", e);

    // Roll back to pre-restore backup
    const backupExists = await FileSystem.getInfoAsync(preRestoreBackupPath);
    if (backupExists.exists) {
      try {
        await FileSystem.copyAsync({
          from: preRestoreBackupPath,
          to: DB_PATH,
        });
        Alert.alert(
          "Restore Failed",
          "Could not restore backup. Your original data has been recovered."
        );
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
        Alert.alert(
          "Critical Error",
          "Restore failed and original data could not be recovered."
        );
      }
    } else {
      Alert.alert(
        "Restore Failed",
        "Could not restore backup, and no fallback was found."
      );
    }
  }
};
