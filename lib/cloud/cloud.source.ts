import db from '../db';
import { TABLES } from './cloud.tables';

export async function getTableData(table: string): Promise<any[]> {
  try {
    return await db.getAllAsync<any>(`SELECT * FROM ${table};`, []);
  } catch (e) {
    console.warn(`Failed to dump table ${table}`, e);
    return [];
  }
}

export async function getDatabaseDump(): Promise<Record<string, any[]>> {
  const dump: Record<string, any[]> = {};
  for (const table of TABLES) {
    dump[table] = await getTableData(table);
  }
  return dump;
}

export async function getDatabaseDumpString(): Promise<string> {
  return JSON.stringify(await getDatabaseDump(), null, 2);
}

export async function clearDatabase() {
  for (const table of TABLES) {
    await db.execAsync(`DELETE FROM ${table};`);
  }
}

export async function restoreDatabaseFromDump(dump: string | Record<string, any[]>): Promise<void> {
  const data: Record<string, any[]> =
    typeof dump === 'string' ? JSON.parse(dump) : dump;
  await clearDatabase();
  for (const table of TABLES) {
    const rows = data[table] || [];
    for (const row of rows) {
      const keys = Object.keys(row);
      if (keys.length === 0) continue;
      await db.runAsync(
        `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys
          .map(() => '?')
          .join(', ')});`,
        keys.map((k) => row[k])
      );
    }
  }
}
