import { convertToLocal, convertToUTC } from '@/lib/db-service-notifications';

describe('convertToLocal & convertToUTC', () => {
  // April 22, 2025 12:34:56 UTC
  const utcIso = '2025-04-22T12:34:56.000Z';
  const utcDate = new Date(utcIso);

  it('convertToLocal preserves the underlying timestamp', () => {
    const localDate = convertToLocal(utcDate);
    expect(localDate.getTime()).toBe(utcDate.getTime());
  });

  it('convertToLocal shifts the displayed hour by the local timezone offset', () => {
    const localDate = convertToLocal(utcDate);
    // getTimezoneOffset is minutes difference: UTC − local
    const offsetHours = utcDate.getTimezoneOffset() / 60;
    // localHour = UTC hour − offsetHours  (mod 24)
    const expectedLocalHour = (utcDate.getUTCHours() - offsetHours + 24) % 24;
    expect(localDate.getHours()).toBe(expectedLocalHour);
  });

  it('convertToUTC preserves the underlying timestamp', () => {
    const backToUtc = convertToUTC(utcDate);
    expect(backToUtc.getTime()).toBe(utcDate.getTime());
  });

  it('convertToUTC is the inverse of convertToLocal', () => {
    const localDate = convertToLocal(utcDate);
    const roundTripped = convertToUTC(localDate);
    expect(roundTripped.getTime()).toBe(utcDate.getTime());
  });
});