import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as Updates from "expo-updates";
import { Alert } from "react-native";

const DB_FILENAME = "reminders.db";
const BACKUP_FILENAME = "offcue-backup.db";
const DB_DIR = FileSystem.documentDirectory + `SQLite`;
const DB_PATH = `${DB_DIR}/${DB_FILENAME}`;
const BACKUP_PATH = `${DB_DIR}/${BACKUP_FILENAME}`;

export const backupDatabase = async () => {
  const info = await FileSystem.getInfoAsync(DB_PATH);
  if (!info.exists) {
    Alert.alert("Error", "Database not found.");
    return;
  }

  await FileSystem.copyAsync({
    from: DB_PATH,
    to: BACKUP_PATH,
  });

  await Sharing.shareAsync(BACKUP_PATH);
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
    await FileSystem.copyAsync({ from: selectedUri, to: DB_PATH });
    Alert.alert("Success", "Backup restored. The app will now restart.", [
      {
        text: "OK",
        onPress: async () => {
          await Updates.reloadAsync(); // Restart app
        },
      },
    ]);
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
