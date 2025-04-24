// lib/__tests__/db-service-notifications/createNotifications.test.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { createNotifications, NotificationTime } from '@/lib/db-service-notifications';
import * as db_source from '@/lib/db-source';

describe('createNotifications', () => {
  const reminder = { id: 123 };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does nothing when notifications list is empty', async () => {
    const spy = jest.spyOn(db_source, 'createNotification').mockResolvedValue(1);
    await createNotifications(reminder, []);
    expect(spy).not.toHaveBeenCalled();
  });

  it('calls createNotification with correct args for each notification', async () => {
    const notifications: NotificationTime[] = [
      { scheduled_at: '2025-01-01T00:15:00.000Z', interval_index: 0, segment_index: 0 },
      { scheduled_at: '2025-01-01T00:45:00.000Z', interval_index: 1, segment_index: 2 },
    ];
    const spy = jest.spyOn(db_source, 'createNotification').mockResolvedValue(1);

    await createNotifications(reminder, notifications);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1,
      123,
      dayjs(notifications[0].scheduled_at).utc().format('YYYY-MM-DD HH:mm:ssZ'),
      notifications[0].interval_index,
      notifications[0].segment_index
    );
    expect(spy).toHaveBeenNthCalledWith(2,
      123,
      dayjs(notifications[1].scheduled_at).utc().format('YYYY-MM-DD HH:mm:ssZ'),
      notifications[1].interval_index,
      notifications[1].segment_index
    );
  });
});