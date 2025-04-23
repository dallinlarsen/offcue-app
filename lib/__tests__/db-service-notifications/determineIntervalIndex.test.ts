// lib/__tests__/db-service-notifications/determineIntervalIndex.test.ts
import { determineIntervalIndex } from '@/lib/db-service-notifications';
import * as db_source from '@/lib/db-source';

describe('determineIntervalIndex', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 0 when no next notification exists', async () => {
    // Stub getNextNotification to resolve to null
    jest.spyOn(db_source, 'getNextNotification').mockResolvedValue(null);

    const reminderId = 42;
    const result = await determineIntervalIndex(reminderId);

    expect(db_source.getNextNotification).toHaveBeenCalledWith(reminderId);
    expect(result).toBe(0);
  });

  it('returns existing interval_index + 1 when a next notification exists', async () => {
    // Stub getNextNotification to resolve to a notification with interval_index = 5
    jest.spyOn(db_source, 'getNextNotification').mockResolvedValue({ interval_index: 5 });

    const reminderId = 99;
    const result = await determineIntervalIndex(reminderId);

    expect(db_source.getNextNotification).toHaveBeenCalledWith(reminderId);
    expect(result).toBe(6);
  });
});