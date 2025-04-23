process.env.TZ = 'America/Denver';

import dayjs from 'dayjs';
import { calculateCurrentInterval, convertToLocal, convertToUTC, splitIntervalIntoSegments } from '@/lib/db-service-notifications';

describe('calculateCurrentInterval (local→startOf→UTC)', () => {
  it('calculates a 1-day interval at index 0 correctly', () => {
    const reminder = {
      created_at: new Date(Date.UTC(2025, 0, 15, 10, 23, 45)), // 2025-01-15 10:23:45 UTC
      interval_type: 'day',
      interval_num: 1,
    };

    const { start, end } = calculateCurrentInterval(reminder, 0);

    // 1) Convert to local time
    const local = convertToLocal(reminder.created_at);
    // 2) Floor to local midnight
    const localStartOfDay = dayjs(local).startOf('day').toDate();
    // 3) Convert that back to UTC
    const expectedStart = convertToUTC(localStartOfDay).getTime();
    expect(start.getTime()).toBe(expectedStart);

    // Similarly for the end: local endOf('day') → UTC
    const localEndOfDay = dayjs(local).endOf('day').toDate();
    const expectedEnd = convertToUTC(localEndOfDay).getTime();
    expect(end.getTime()).toBe(expectedEnd);
  });

  it('calculates a 3-week interval at index 0 correctly', () => {
    const reminder = {
      created_at: new Date(Date.UTC(2025, 0, 8, 0, 0, 0)), // Jan 8, 2025 UTC
      interval_type: 'week',
      interval_num: 3,
    };

    const { start, end } = calculateCurrentInterval(reminder, 0);

    const local = convertToLocal(reminder.created_at);
    const localStartOfWeek = dayjs(local).startOf('week').toDate();
    const expectedStart = convertToUTC(localStartOfWeek).getTime();
    expect(start.getTime()).toBe(expectedStart);

    const localEnd = dayjs(localStartOfWeek)
      .add(reminder.interval_num, 'week')
      .subtract(1, 'millisecond')
      .toDate();
    const expectedEnd = convertToUTC(localEnd).getTime();
    expect(end.getTime()).toBe(expectedEnd);
  });

  it('calculates a 1-month interval at index 1 correctly', () => {
    const reminder = {
      created_at: new Date(Date.UTC(2025, 0, 15, 0, 0, 0)), // Jan 15, 2025
      interval_type: 'month',
      interval_num: 1,
    };

    const { start, end } = calculateCurrentInterval(reminder, 1);

    const local = convertToLocal(reminder.created_at);
    const localStartOfNextMonth = dayjs(local)
      .startOf('month')
      .add(reminder.interval_num * 1, 'month')
      .toDate();
    const expectedStart = convertToUTC(localStartOfNextMonth).getTime();
    expect(start.getTime()).toBe(expectedStart);

    const localEnd = dayjs(localStartOfNextMonth)
      .add(reminder.interval_num, 'month')
      .subtract(1, 'millisecond')
      .toDate();
    const expectedEnd = convertToUTC(localEnd).getTime();
    expect(end.getTime()).toBe(expectedEnd);
  });

  it('calculates a 2-year interval at index 0 correctly', () => {
    const reminder = {
      created_at: new Date(Date.UTC(2023, 5, 10, 0, 0, 0)), // Jun 10, 2023
      interval_type: 'year',
      interval_num: 2,
    };

    const { start, end } = calculateCurrentInterval(reminder, 0);

    const local = convertToLocal(reminder.created_at);
    const localStartOfYear = dayjs(local).startOf('year').toDate();
    const expectedStart = convertToUTC(localStartOfYear).getTime();
    expect(start.getTime()).toBe(expectedStart);

    const localEnd = dayjs(localStartOfYear)
      .add(reminder.interval_num, 'year')
      .subtract(1, 'millisecond')
      .toDate();
    const expectedEnd = convertToUTC(localEnd).getTime();
    expect(end.getTime()).toBe(expectedEnd);
  });
});

describe('splitIntervalIntoSegments', () => {
  it('splits a 4-hour interval into 4 equal 1-hour segments', () => {
    const intervalStart = new Date(Date.UTC(2025, 0, 1, 0, 0, 0));  // Jan 1 00:00 UTC
    const intervalEnd = new Date(Date.UTC(2025, 0, 1, 4, 0, 0));  // Jan 1 04:00 UTC
    const segments = splitIntervalIntoSegments(intervalStart, intervalEnd, 4);

    expect(segments).toHaveLength(4);
    segments.forEach((seg, idx) => {
      // Each segment should cover exactly one hour
      const expectedStart = Date.UTC(2025, 0, 1, idx, 0, 0);
      const expectedEnd = Date.UTC(2025, 0, 1, idx + 1, 0, 0);
      expect(seg.start.getTime()).toBe(expectedStart);
      expect(seg.end.getTime()).toBe(expectedEnd);
    });
  });

  it('splits a 1-minute interval into 2 segments of 30 seconds each', () => {
    const intervalStart = new Date(Date.UTC(2025, 0, 1, 0, 0, 0));    // 00:00:00
    const intervalEnd = new Date(Date.UTC(2025, 0, 1, 0, 1, 0));    // 00:01:00
    const segments = splitIntervalIntoSegments(intervalStart, intervalEnd, 2);

    expect(segments).toHaveLength(2);
    // First 30‑second chunk
    expect(segments[0].start.getTime()).toBe(Date.UTC(2025, 0, 1, 0, 0, 0));
    expect(segments[0].end.getTime()).toBe(Date.UTC(2025, 0, 1, 0, 0, 30));
    // Second 30‑second chunk
    expect(segments[1].start.getTime()).toBe(Date.UTC(2025, 0, 1, 0, 0, 30));
    expect(segments[1].end.getTime()).toBe(Date.UTC(2025, 0, 1, 0, 1, 0));
  });

  it('returns a single segment identical to the original interval when times=1', () => {
    const intervalStart = new Date(Date.UTC(2025, 5, 10, 12, 0, 0));  // Jun 10 12:00 UTC
    const intervalEnd = new Date(Date.UTC(2025, 5, 10, 14, 30, 0)); // Jun 10 14:30 UTC
    const segments = splitIntervalIntoSegments(intervalStart, intervalEnd, 1);

    expect(segments).toHaveLength(1);
    expect(segments[0].start.getTime()).toBe(intervalStart.getTime());
    expect(segments[0].end.getTime()).toBe(intervalEnd.getTime());
  });
});