import * as FileSystem from 'expo-file-system';
import { CloudStorage } from 'react-native-cloud-storage';
import {
  getDatabaseDumpString,
  restoreDatabaseFromDump,
} from './cloud.source';

export async function dumpDatabaseToFile(): Promise<string> {
  const json = await getDatabaseDumpString();
  const path = `${FileSystem.documentDirectory}database_dump.json`;
  await FileSystem.writeAsStringAsync(path, json);
  return path;
}

export async function getCloudDatabaseDump(): Promise<string | null> {
  try {
    return await CloudStorage.readFile('/database_dump.json');
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
  await CloudStorage.writeFile('/database_dump.json', local);
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
