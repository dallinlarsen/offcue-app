import * as FileSystem from "expo-file-system";
import { CloudStorage, CloudStorageScope } from "react-native-cloud-storage";
import { reopenDatabase } from "../db";

const BACKUP_PATH = `/reminders.db`;
const LOCAL_DB_PATH = `${FileSystem.documentDirectory}SQLite/reminders.db`;

const provider = new CloudStorage(CloudStorage.getDefaultProvider());
provider.setProviderOptions({ scope: CloudStorageScope.Documents });

async function getLocalDatabaseBase64(): Promise<string> {
  return await FileSystem.readAsStringAsync(LOCAL_DB_PATH, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

async function writeLocalDatabaseFromBase64(data: string) {
  await FileSystem.writeAsStringAsync(LOCAL_DB_PATH, data, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function getCloudDatabaseDump(): Promise<string | null> {
  try {
    return await provider.readFile(BACKUP_PATH, "base64");
  } catch {
    return null;
  }
}

export async function isDatabaseDifferentFromCloud(): Promise<boolean> {
  const local = await getLocalDatabaseBase64();
  const remote = await getCloudDatabaseDump();
  return remote !== local;
}

export async function syncDatabaseToCloud(): Promise<boolean> {
  const local = await getLocalDatabaseBase64();
  const remote = await getCloudDatabaseDump();
  if (remote === local) {
    return false;
  }

  await provider.writeFile(BACKUP_PATH, local, "base64");

  return true;
}

export async function restoreDatabaseFromCloud(): Promise<boolean> {
  const remote = await getCloudDatabaseDump();
  if (!remote) {
    return false;
  }
  await writeLocalDatabaseFromBase64(remote);
  await reopenDatabase();
  return true;
}
