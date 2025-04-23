import dayjs from 'dayjs';
import {
  getScheduleWindowsWithinInterval,
  convertToLocal,
  convertToUTC
} from '@/lib/db-service-notifications';

describe('getScheduleWindowsWithinInterval', () => {
  it('returns a single full window when schedule and interval align on one day', () => {
    const schedule = {
      is_sunday: 0, is_monday: 0, is_tuesday: 0,
      is_wednesday: 1,
      is_thursday: 0, is_friday: 0, is_saturday: 0,
      start_time: '09:00',
      end_time:   '12:00',
    };
    const intervalStart = new Date(Date.UTC(2025, 0, 15, 8, 0, 0));  // Wed Jan 15 08:00 UTC
    const intervalEnd   = new Date(Date.UTC(2025, 0, 15,20, 0, 0)); // Wed Jan 15 20:00 UTC
    const localIntervalStart = convertToLocal(intervalStart);
    const localIntervalEnd   = convertToLocal(intervalEnd);

    const windows = getScheduleWindowsWithinInterval(schedule, localIntervalStart, localIntervalEnd);
    expect(windows).toHaveLength(1);
    expect(windows[0]).toEqual({
      start: new Date(Date.UTC(2025, 0, 15, 16, 0, 0)), // 09:00 MST → 16:00 UTC
      end:   new Date(Date.UTC(2025, 0, 15, 19, 0, 0)), // 12:00 MST → 19:00 UTC
    });
  });

  it('returns one window per applicable day within a multi-day interval', () => {
    const schedule = {
      is_sunday:    0,
      is_monday:    0,
      is_tuesday:   0,
      is_wednesday: 1,
      is_thursday:  0,
      is_friday:    1,
      is_saturday:  0,
      start_time: '09:00',
      end_time:   '10:00',
    };
    const intervalStart = new Date(Date.UTC(2025, 0, 15, 0, 0, 0)); // Wed Jan 15 00:00 UTC
    const intervalEnd   = new Date(Date.UTC(2025, 0, 17,18, 0, 0)); // Fri Jan 17 18:00 UTC
    const localIntervalStart = convertToLocal(intervalStart);
    const localIntervalEnd   = convertToLocal(intervalEnd);

    const windows = getScheduleWindowsWithinInterval(schedule, localIntervalStart, localIntervalEnd);
    expect(windows).toHaveLength(2);
    expect(windows).toEqual([
      {
        start: new Date(Date.UTC(2025, 0, 15, 16, 0, 0)), // Wed 09:00 MST → 16:00 UTC
        end:   new Date(Date.UTC(2025, 0, 15, 17, 0, 0)), // Wed 10:00 MST → 17:00 UTC
      },
      {
        start: new Date(Date.UTC(2025, 0, 17, 16, 0, 0)), // Fri 09:00 MST → 16:00 UTC
        end:   new Date(Date.UTC(2025, 0, 17, 17, 0, 0)), // Fri 10:00 MST → 17:00 UTC
      },
    ]);
  });

  it('clamps a window when the interval cuts off before schedule start or after schedule end', () => {
    const schedule = {
      is_sunday: 0, is_monday: 0, is_tuesday: 0,
      is_wednesday: 1,
      is_thursday: 0, is_friday: 0, is_saturday: 0,
      start_time: '07:00',
      end_time:   '18:00',
    };
    const intervalStart = new Date(Date.UTC(2025, 0, 15,10, 0, 0)); // Wed Jan 15 10:00 UTC
    const intervalEnd   = new Date(Date.UTC(2025, 0, 15,16, 0, 0)); // Wed Jan 15 16:00 UTC
    const localIntervalStart = convertToLocal(intervalStart);
    const localIntervalEnd   = convertToLocal(intervalEnd);

    const windows = getScheduleWindowsWithinInterval(schedule, localIntervalStart, localIntervalEnd);
    expect(windows).toHaveLength(1);
    expect(windows[0]).toEqual({
      start: new Date(Date.UTC(2025, 0, 15, 14, 0, 0)), // clamp from 07:00 MST → 14:00 UTC
      end:   new Date(Date.UTC(2025, 0, 15, 16, 0, 0)), // clamp to 09:00 MST → 16:00 UTC
    });
  });

  it('returns an empty array when no days in the interval match the schedule', () => {
    const schedule = {
      is_sunday:  0, is_monday:    1, is_tuesday:   0,
      is_wednesday:0, is_thursday:  0, is_friday:    0,
      is_saturday: 0,
      start_time: '08:00',
      end_time:   '09:00',
    };
    const intervalStart = new Date(Date.UTC(2025, 0, 15, 0, 0, 0));
    const intervalEnd   = new Date(Date.UTC(2025, 0, 15,23,59,59));
    const localIntervalStart = convertToLocal(intervalStart);
    const localIntervalEnd   = convertToLocal(intervalEnd);

    const windows = getScheduleWindowsWithinInterval(schedule, localIntervalStart, localIntervalEnd);
    expect(windows).toHaveLength(0);
  });
});