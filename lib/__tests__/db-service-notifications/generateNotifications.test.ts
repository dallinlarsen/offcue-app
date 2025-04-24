import { generateNotificationTimes } from '@/lib/db-service-notifications';
import * as svc from '@/lib/db-service-notifications';

describe('generateNotificationTimes', () => {
  const segmentStart = new Date(Date.UTC(2027, 0, 1, 0, 0, 0));
  const segmentEnd   = new Date(Date.UTC(2027, 0, 1, 1, 0, 0));

  const reminder = {
    created_at: new Date(Date.UTC(2027, 0, 1, 0, 30, 0)),
    start_date: new Date(Date.UTC(2027, 0, 1, 0, 30, 0)),
    interval_type: 'hour',
    interval_num: 1,
    times: 2,
    id: 123,
  };

  const schedule = {
    is_sunday:    0,
    is_monday:    1,
    is_tuesday:   1,
    is_wednesday: 1,
    is_thursday:  1,
    is_friday:    1,
    is_saturday:  0,
    start_time: '08:00',
    end_time:   '18:00',
  };

  beforeEach(() => {
    // Stub calculateCurrentInterval to return our fixed window
    jest.spyOn(svc, 'calculateCurrentInterval')
      .mockReturnValue({ start: segmentStart, end: segmentEnd });
    // Stub getScheduleWindowsWithinInterval to return exactly our window
    jest.spyOn(svc, 'getScheduleWindowsWithinInterval')
      .mockReturnValue([{ start: segmentStart, end: segmentEnd }]);
    // Stub mergeTimeWindows to be identity
    jest.spyOn(svc, 'mergeTimeWindows')
      .mockImplementation((windows) => windows);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('generates two notifications evenly spaced when bias=0.5', () => {
    // Force Math.random to always produce 0.5
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const notifications = generateNotificationTimes(reminder, [schedule], 0, 0.5);

    expect(notifications).toHaveLength(2);
    expect(notifications).toEqual([
      {
        scheduled_at: new Date(Date.UTC(2027, 0, 1, 0, 14, 0)).toISOString(),
        interval_index: 0,
        segment_index: 0,
      },
      {
        scheduled_at: new Date(Date.UTC(2027, 0, 1, 0, 43, 0)).toISOString(),
        interval_index: 0,
        segment_index: 1,
      },
    ]);
  });

  it('returns empty array when no allowed windows', () => {
    jest.spyOn(svc, 'getScheduleWindowsWithinInterval').mockReturnValue([]);
    const notifications = generateNotificationTimes(reminder, [{} as any], 0, 0.5);
    expect(notifications).toEqual([]);
  });
});