import { generateNotificationTimes } from "@/lib/db-service-notifications";

describe('generateNotificationTimes', () => {
  const reminder = {
    id: 1,
    created_at: new Date('2025-04-18T00:00:00Z'),
    times: 3,
    interval_type: 'day' as const,
    interval_num: 1,
  };
  // A “full‑day” schedule: all days enabled, midnight→23:59
  const fullDaySchedule = {
    is_sunday: 1,
    is_monday: 1,
    is_tuesday: 1,
    is_wednesday: 1,
    is_thursday: 1,
    is_friday: 1,
    is_saturday: 1,
    start_time: '00:00',
    end_time: '23:59',
  };

  beforeAll(() => {
    // Make randomness deterministic
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterAll(() => {
    (Math.random as jest.MockedFunction<typeof Math.random>).mockRestore();
  });

  it('returns exactly `times` notifications for a full‑day schedule', () => {
    const notifs = generateNotificationTimes(reminder, [fullDaySchedule], 0, 0.5);
    expect(notifs).toHaveLength(reminder.times);
    notifs.forEach((n) => {
      expect(n.interval_index).toBe(0);
      expect(typeof n.scheduled_at).toBe('string');
    });
  });

  it('yields an empty array if no minutes are allowed', () => {
    const off: any = { ...fullDaySchedule, is_monday: 0, is_tuesday: 0, is_wednesday: 0,
                       is_thursday: 0, is_friday: 0, is_saturday: 0, is_sunday: 0 };
    const notifs = generateNotificationTimes(reminder, [off], 0, 0.5);
    expect(notifs).toEqual([]);
  });
});