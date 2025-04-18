// __tests__/persistenceAndFlows.test.ts

import * as svc from '@/lib/db-service-notifications';
import * as db from '@/lib/db-source';
import * as deviceService from '@/lib/device-notifications.service';

jest.mock('@/lib/db-source');
jest.mock('@/lib/device-notifications.service');

describe('createInitialNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates and schedules notifications for a new reminder', async () => {
    // 1) Stub out generateNotificationTimes so it always returns two future slots:
    const fakeSlots = [
      { scheduled_at: new Date(Date.now() + 1000).toISOString(), interval_index: 0, segment_index: 0 },
      { scheduled_at: new Date(Date.now() + 2000).toISOString(), interval_index: 0, segment_index: 1 },
    ];
    jest.spyOn(svc, 'generateNotificationTimes').mockReturnValue(fakeSlots as any);

    // 2) Arrange the reminder and its schedule
    (db.getReminder as jest.Mock).mockResolvedValue({
      id: 42,
      times: 2,
      interval_type: 'day',
      interval_num: 1,
      // you can also include a dummy created_at if needed, but we’ve stubbed generateNotificationTimes anyway
    });
    (db.getReminderSchedules as jest.Mock).mockResolvedValue([{
      is_sunday: 1, is_monday: 1, /* …all days… */ is_saturday: 1,
      start_time: '00:00', end_time: '23:59'
    }]);
    (db.getNextNotification as jest.Mock).mockResolvedValue(null);

    const spyCreate = db.createNotification as jest.Mock;

    // 3) Act
    await svc.createInitialNotifications(42, 2, 0.5);

    // 4) Assert
    expect(spyCreate).toHaveBeenCalledTimes(2);
    expect(deviceService.scheduleAllUpcomingNotifications).toHaveBeenCalled();
  });
});

describe('recalcFutureNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // stub createInitialNotifications so we don't recurse
    jest.spyOn(svc, 'createInitialNotifications').mockResolvedValue();
  });

  it('deletes future notifications and calls createInitialNotifications', async () => {
    await svc.recalcFutureNotifications(99, 5, 0.3);

    expect(db.deleteFutureNotifications).toHaveBeenCalledWith(99);
    expect(svc.createInitialNotifications).toHaveBeenCalledWith(99, 5, 0.3);
  });
});