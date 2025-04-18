import { calculateCurrentInterval } from "@/lib/db-service-notifications";

describe('calculateCurrentInterval', () => {
  const baseReminder = {
    created_at: new Date('2025-04-01T10:00:00Z'),
    interval_type: 'day' as const,
    interval_num: 2,
  };

  it('computes a 2‑day interval, 0th index', () => {
    const { start, end } = calculateCurrentInterval(baseReminder, 0);
    // start-of-day on 2025‑04‑01 local
    expect(start).toBeInstanceOf(Date);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });

  it('shifts start by 2 days for intervalIndex = 1', () => {
    const { start } = calculateCurrentInterval(baseReminder, 1);
    // should land on the start of local 2025‑04‑03
    const iso = start.toISOString().slice(0, 10);
    expect(iso).toBe('2025-04-03');
  });

  it('handles weekly intervals correctly', () => {
    const weekly = {
      created_at: new Date('2025-01-06T08:00:00Z'), // a Monday
      interval_type: 'week' as const,
      interval_num: 1,
    };
    const { start, end } = calculateCurrentInterval(weekly, 0);
    // start-of-week should be Sunday
    expect(start.getUTCDay()).toBe(0);
    // end should be 6 days later (Saturday end‑of‑week)
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });
});