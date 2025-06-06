import * as FileSystem from "expo-file-system";
import { CloudStorage, CloudStorageScope } from "react-native-cloud-storage";
import { getDatabaseDumpString, restoreDatabaseFromDump } from "./cloud.source";

const BACKUP_PATH = `/database_dump.json`;
const provider = new CloudStorage(CloudStorage.getDefaultProvider());
provider.setProviderOptions({ scope: CloudStorageScope.Documents });

export async function dumpDatabaseToFile(): Promise<string> {
  const json = await getDatabaseDumpString();
  await FileSystem.writeAsStringAsync(BACKUP_PATH, json);
  return BACKUP_PATH;
}

export async function getCloudDatabaseDump(): Promise<string | null> {
  try {
    return await provider.readFile(BACKUP_PATH);
  } catch {
    return null;
  }
}

export async function isDatabaseDifferentFromCloud(): Promise<boolean> {
  const local = await getDatabaseDumpString();
  const remote = await getCloudDatabaseDump();
  return remote !== local;
}

export async function syncDatabaseToCloud(): Promise<boolean> {
  const local = await getDatabaseDumpString();
  const remote = await getCloudDatabaseDump();
  if (remote === local) {
    return false;
  }

  await provider.writeFile(BACKUP_PATH, local);

  return true;
}

export async function restoreDatabaseFromCloud(): Promise<boolean> {
  const remote = await getCloudDatabaseDump();
  if (!remote) {
    return false;
  }
  await restoreDatabaseFromDump(remote);
  return true;
}
