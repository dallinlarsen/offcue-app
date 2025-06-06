import { db } from "../db";
import { syncDatabaseToCloud } from "../cloud/cloud.service";
type GenericObject = { [key: string]: any };

function formatBoolean(value: any) {
  return typeof value === "boolean" ? (value ? 1 : 0) : value;
}

export async function insertIntoTable<T extends GenericObject>(
  tableName: string,
  model: T
) {
  const modelKeys = Object.keys(model);

  console.log(
    `
    INSERT INTO ${tableName} (${modelKeys.join(", ")}, created_at, updated_at)
    VALUES (${modelKeys
      .map((_) => "?")
      .join(", ")}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);    
    `,
    modelKeys.map((k) => formatBoolean(model[k]))
  );

  const result = await db.runAsync(
    `
    INSERT INTO ${tableName} (${modelKeys.join(", ")}, created_at, updated_at)
    VALUES (${modelKeys
      .map((_) => "?")
      .join(", ")}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);    
    `,
    modelKeys.map((k) => formatBoolean(model[k]))
  );

  // Trigger cloud sync but don't block
  syncDatabaseToCloud().catch(() => {});

  return result.lastInsertRowId;
}

export async function updateTable<
  T extends GenericObject,
  X extends GenericObject
>(tableName: string, model: T, where: X) {
  const modelKeys = Object.keys(model);
  const whereKeys = Object.keys(where);

  console.log(
    `
    UPDATE ${tableName}
    SET ${modelKeys
      .map((k) => `${k} = ?`)
      .join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE ${whereKeys.map((k) => `${k} = ?`).join(" AND ")};    
    `,
    [
      ...modelKeys.map((k) => formatBoolean(model[k])),
      ...whereKeys.map((k) => formatBoolean(where[k])),
    ]
  );

  await db.runAsync(
    `
    UPDATE ${tableName}
    SET ${modelKeys
      .map((k) => `${k} = ?`)
      .join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE ${whereKeys.map((k) => `${k} = ?`).join(" AND ")};    
    `,
    [
      ...modelKeys.map((k) => formatBoolean(model[k])),
      ...whereKeys.map((k) => formatBoolean(where[k])),
    ]
  );

  syncDatabaseToCloud().catch(() => {});
}

export async function deleteFromTable<T extends GenericObject>(
  tableName: string,
  where: T
) {
  const whereKeys = Object.keys(where);

  await db.runAsync(
    `
    DELETE FROM ${tableName}
    WHERE ${whereKeys.map((k) => `${k} = ?`).join(" AND ")};  
    `,
    whereKeys.map((k) => formatBoolean(where[k]))
  );

  syncDatabaseToCloud().catch(() => {});
}

export function convertIntegerValuesToBoolean<T extends { [key: string]: any }>(
  model: T,
  keys: (keyof T)[]
) {
  for (const key of keys) {
    (model as any)[key] = model[key] === 1;
  }

  return model;
}
