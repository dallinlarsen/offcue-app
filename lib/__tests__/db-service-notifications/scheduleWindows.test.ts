import { getScheduleWindowsWithinInterval } from "@/lib/db-service-notifications";

describe('getScheduleWindowsWithinInterval', () => {
  const schedule = {
    is_monday: 1,
    is_tuesday: 1,
    is_wednesday: 0,
    is_thursday: 0,
    is_friday: 0,
    is_saturday: 0,
    is_sunday: 0,
    start_time: '09:00',
    end_time: '17:00',
  };

  it('returns windows only for enabled days within the interval', () => {
    // Interval spans Mon–Tue
    const monday = new Date('2025-04-14T00:00:00'); // Monday
    const wednesdayMid = new Date('2025-04-16T00:00:00'); // Wednesday
    const windows = getScheduleWindowsWithinInterval(schedule, monday, wednesdayMid);

    // Should include a window for Monday 09–17 and Tuesday 09–17
    expect(windows.length).toBe(2);
    windows.forEach((w) => {
      const hr = w.start.getHours();
      expect(hr).toBe(9);
      expect(w.end.getHours()).toBe(17);
    });
  });

  it('clamps windows at the interval edges', () => {
    // Interval starts at 12:00 on Monday
    const start = new Date('2025-04-14T12:00:00');
    const end = new Date('2025-04-14T15:00:00');
    const windows = getScheduleWindowsWithinInterval(schedule, start, end);

    // Only one window, from 12:00 → 15:00 (clamped within 09–17)
    expect(windows).toHaveLength(1);
    expect(windows[0].start.getHours()).toBe(12);
    expect(windows[0].end.getHours()).toBe(15);
  });

  it('returns an empty array if no days are enabled', () => {
    const off: any = { ...schedule, is_monday: 0, is_tuesday: 0 };
    const windows = getScheduleWindowsWithinInterval(off, new Date(), new Date(Date.now() + 86400000));
    expect(windows).toEqual([]);
  });
});