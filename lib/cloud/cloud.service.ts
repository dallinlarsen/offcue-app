import * as FileSystem from 'expo-file-system';
import db from '../db';
import { CloudStorage } from 'react-native-cloud-storage';

const TABLES = [
  'reminders',
  'notifications',
  'notes',
  'schedules',
  'reminder_schedule',
  'settings',
];

async function getTableData(table: string) {
  try {
    return await db.getAllAsync<any>(`SELECT * FROM ${table};`, []);
  } catch (e) {
    console.warn(`Failed to dump table ${table}`, e);
    return [];
  }
}

export async function getDatabaseDump(): Promise<string> {
  const dump: Record<string, any[]> = {};
  for (const t of TABLES) {
    dump[t] = await getTableData(t);
  }
  return JSON.stringify(dump, null, 2);
}

export async function dumpDatabaseToFile(): Promise<string> {
  const json = await getDatabaseDump();
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
  const local = await getDatabaseDump();
  const remote = await getCloudDatabaseDump();
  return remote !== local;
}

export async function syncDatabaseToCloud(): Promise<boolean> {
  const local = await getDatabaseDump();
  const remote = await getCloudDatabaseDump();
  if (remote === local) {
    return false;
  }
  await CloudStorage.writeFile('/database_dump.json', local);
  return true;
}
