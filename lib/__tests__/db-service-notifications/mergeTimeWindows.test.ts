import { mergeTimeWindows } from '@/lib/db-service-notifications';

describe('mergeTimeWindows', () => {
  it('returns empty array when given no windows', () => {
    expect(mergeTimeWindows([])).toEqual([]);
  });

  it('returns the same single window when only one window is provided', () => {
    const windows = [{
      start: new Date(Date.UTC(2025, 0, 1, 9, 0, 0)),
      end:   new Date(Date.UTC(2025, 0, 1, 10, 0, 0)),
    }];
    expect(mergeTimeWindows(windows)).toEqual(windows);
  });

  it('does not merge non-overlapping windows', () => {
    const input = [
      { start: new Date(Date.UTC(2025, 0, 1, 8, 0, 0)),  end: new Date(Date.UTC(2025, 0, 1, 9, 0, 0))  },
      { start: new Date(Date.UTC(2025, 0, 1, 10, 0, 0)), end: new Date(Date.UTC(2025, 0, 1, 11, 0, 0)) },
    ];
    expect(mergeTimeWindows(input)).toEqual(input);
  });

  it('merges two overlapping windows into one', () => {
    const input = [
      { start: new Date(Date.UTC(2025, 0, 1, 8, 30, 0)), end: new Date(Date.UTC(2025, 0, 1, 10, 0, 0)) },
      { start: new Date(Date.UTC(2025, 0, 1, 9, 45, 0)), end: new Date(Date.UTC(2025, 0, 1, 11, 0, 0)) },
    ];
    const expected = [
      { start: new Date(Date.UTC(2025, 0, 1, 8, 30, 0)), end: new Date(Date.UTC(2025, 0, 1, 11, 0, 0)) },
    ];
    expect(mergeTimeWindows(input)).toEqual(expected);
  });

  it('merges adjacent windows (end == next start) into one', () => {
    const input = [
      { start: new Date(Date.UTC(2025, 0, 1, 8, 0, 0)), end: new Date(Date.UTC(2025, 0, 1, 9, 0, 0)) },
      { start: new Date(Date.UTC(2025, 0, 1, 9, 0, 0)), end: new Date(Date.UTC(2025, 0, 1, 10, 0, 0)) },
    ];
    const expected = [
      { start: new Date(Date.UTC(2025, 0, 1, 8, 0, 0)), end: new Date(Date.UTC(2025, 0, 1, 10, 0, 0)) },
    ];
    expect(mergeTimeWindows(input)).toEqual(expected);
  });

  it('merges multiple overlapping and non-overlapping windows correctly', () => {
    const input = [
      { start: new Date(Date.UTC(2025, 0, 1, 7, 0, 0)),  end: new Date(Date.UTC(2025, 0, 1, 8, 0, 0))  },
      { start: new Date(Date.UTC(2025, 0, 1, 7, 30, 0)), end: new Date(Date.UTC(2025, 0, 1, 9, 0, 0))  },
      { start: new Date(Date.UTC(2025, 0, 1, 10, 0, 0)), end: new Date(Date.UTC(2025, 0, 1, 11, 0, 0)) },
      { start: new Date(Date.UTC(2025, 0, 1, 10, 30, 0)), end: new Date(Date.UTC(2025, 0, 1, 12, 0, 0)) },
    ];
    const expected = [
      { start: new Date(Date.UTC(2025, 0, 1, 7, 0, 0)),  end: new Date(Date.UTC(2025, 0, 1, 9, 0, 0))  },
      { start: new Date(Date.UTC(2025, 0, 1, 10, 0, 0)), end: new Date(Date.UTC(2025, 0, 1, 12, 0, 0)) },
    ];
    expect(mergeTimeWindows(input)).toEqual(expected);
  });
});