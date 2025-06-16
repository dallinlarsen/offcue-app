export const openDatabaseSync = jest.fn(() => ({
  runAsync: jest.fn(async (_sql?: string, _params?: any[]) => ({
    lastInsertRowId: 1,
  })),
  execAsync: jest.fn(async (_sql?: string) => {}),
  getFirstAsync: jest.fn(
    async <T>(_sql?: string, _params?: any[]) => undefined as unknown as T
  ),
  getAllAsync: jest.fn(async <T>(_sql?: string, _params?: any[]) => [] as T[]),
  closeAsync: jest.fn(async () => {}),
  transaction: jest.fn(),
}));

export const deleteDatabaseAsync = jest.fn(async (_name: string) => {});
