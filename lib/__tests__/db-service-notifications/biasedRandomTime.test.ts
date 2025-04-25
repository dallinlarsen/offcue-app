import { getBiasedRandomTime } from "@/lib/notifications/notifications.service";

describe('getBiasedRandomTime', () => {
  const segmentStart = new Date(Date.UTC(2025, 0, 1, 0, 0, 0)); // Jan 1 00:00 UTC
  const segmentEnd   = new Date(Date.UTC(2025, 0, 1, 1, 0, 0)); // Jan 1 01:00 UTC
  const duration = segmentEnd.getTime() - segmentStart.getTime();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the segment start when Math.random returns 0', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const result = getBiasedRandomTime(segmentStart, segmentEnd, 0.7);
    expect(result.getTime()).toBe(segmentStart.getTime());
  });

  it('returns the segment end when Math.random returns 1', () => {
    jest.spyOn(Math, 'random').mockReturnValue(1);
    const result = getBiasedRandomTime(segmentStart, segmentEnd, 0.3);
    expect(result.getTime()).toBe(segmentEnd.getTime());
  });

  it('defaults bias to 0.5 when bias is out of range', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = getBiasedRandomTime(segmentStart, segmentEnd, -1);
    const expectedTime = segmentStart.getTime() + 0.5 * duration;
    expect(result.getTime()).toBe(expectedTime);
  });

  it('skews towards the start when bias < 0.5', () => {
    // bias = 0 -> exponent = 1 + (0.5 - 0) * 2 = 2
    // Math.random() = 0.5 -> weight = 0.5^2 = 0.25 -> 15 minutes
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = getBiasedRandomTime(segmentStart, segmentEnd, 0);
    const expectedTime = segmentStart.getTime() + 0.25 * duration;
    expect(result.getTime()).toBe(expectedTime);
  });

  it('skews towards the end when bias > 0.5', () => {
    // bias = 1 -> exponent = 1 / (1 + (1 - 0.5) * 2) = 1/2
    // Math.random() = 0.25 -> weight = 0.25^(1/2) = 0.5 -> 30 minutes
    jest.spyOn(Math, 'random').mockReturnValue(0.25);
    const result = getBiasedRandomTime(segmentStart, segmentEnd, 1);
    const expectedTime = segmentStart.getTime() + 0.5 * duration;
    expect(result.getTime()).toBe(expectedTime);
  });
});