import db from "../db";
type GenericObject = { [key: string]: any };

function formatBoolean(value: any) {
  return typeof value === "boolean" ? (value ? 1 : 0) : value;
}

export async function insertIntoTable<T extends GenericObject>(
  tableName: string,
  model: T
) {
  const modelKeys = Object.keys(model);

  const result = await db.runAsync(
    `
    INSERT INTO ${tableName} (${modelKeys.join(", ")}, created_at, updated_at)
    VALUES (${modelKeys
      .map((_) => "?")
      .join(", ")}, CURRENT_TIMESTAMP || '+00:00', CURRENT_TIMESTAMP || '+00:00');
    `,
    modelKeys.map((k) => formatBoolean(model[k]))
  );

  return result.lastInsertRowId;
}

export async function updateTable<
  T extends GenericObject,
  X extends GenericObject
>(tableName: string, model: T, where: X) {
  const modelKeys = Object.keys(model);
  const whereKeys = Object.keys(where);

  await db.runAsync(
    `
    UPDATE ${tableName}
    SET ${modelKeys
      .map((k) => `${k} = ?`)
      .join(", ")}, updated_at = CURRENT_TIMESTAMP || '+00:00'
    WHERE ${whereKeys.map((k) => `${k} = ?`).join(" AND ")};    
    `,
    [
      ...modelKeys.map((k) => formatBoolean(model[k])),
      ...whereKeys.map((k) => formatBoolean(where[k])),
    ]
  );
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

export async function ensureUtcOffset(
  tableName: string,
  columns: string[]
) {
  for (const column of columns) {
    await db.runAsync(
      `UPDATE ${tableName}
       SET ${column} = ${column} || '+00:00'
       WHERE ${column} IS NOT NULL
         AND ${column} NOT LIKE '%+00:00';`
    );
  }
}
