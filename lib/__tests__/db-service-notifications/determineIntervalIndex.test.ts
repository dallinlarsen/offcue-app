// lib/__tests__/db-service-notifications/determineIntervalIndex.test.ts
import { determineIntervalIndex } from "@/lib/notifications/notifications.service";
import * as notificationsSource from "@/lib/notifications/notifications.source";
import { RNotification } from "@/lib/notifications/notifications.types";

describe('determineIntervalIndex', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 0 when no next notification exists', async () => {
    // Stub getNextNotification to resolve to null
    jest
      .spyOn(notificationsSource, 'getNextNotificationByReminderId')
      .mockResolvedValue(null);

    const reminderId = 42;
    const result = await determineIntervalIndex(reminderId);

    expect(notificationsSource.getNextNotificationByReminderId).toHaveBeenCalledWith(reminderId);
    expect(result).toBe(0);
  });

  it('returns existing interval_index + 1 when a next notification exists', async () => {
    // Stub getNextNotification to resolve to a notification with interval_index = 5
    jest
      .spyOn(notificationsSource, "getNextNotificationByReminderId")
      .mockResolvedValue({ interval_index: 5 } as RNotification);

    const reminderId = 99;
    const result = await determineIntervalIndex(reminderId);

    expect(notificationsSource.getNextNotificationByReminderId).toHaveBeenCalledWith(reminderId);
    expect(result).toBe(6);
  });
});