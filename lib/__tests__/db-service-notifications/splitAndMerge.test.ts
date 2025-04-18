import { mergeTimeWindows, splitIntervalIntoSegments } from "@/lib/db-service-notifications";

  describe('splitIntervalIntoSegments', () => {
    it('splits a 60‑min span into 3 equal segments', () => {
      const start = new Date(0);
      const end = new Date(60 * 60 * 1000);
      const segs = splitIntervalIntoSegments(start, end, 3);
  
      expect(segs).toHaveLength(3);
      // second segment should start at 20 min
      expect(segs[1].start.getTime()).toBe(20 * 60 * 1000);
      // each segment should be ~20 min
      expect(segs[2].end.getTime() - segs[2].start.getTime()).toBeCloseTo(20 * 60 * 1000);
    });
  
    it('returns one segment when times = 1', () => {
      const segs = splitIntervalIntoSegments(new Date(0), new Date(1000), 1);
      expect(segs).toHaveLength(1);
      expect(segs[0].start.getTime()).toBe(0);
      expect(segs[0].end.getTime()).toBe(1000);
    });
  });
  
  describe('mergeTimeWindows', () => {
    it('merges two overlapping windows into one', () => {
      const w1 = { start: new Date(0), end: new Date(5) };
      const w2 = { start: new Date(3), end: new Date(10) };
      const merged = mergeTimeWindows([w1, w2]);
      expect(merged).toHaveLength(1);
      expect(merged[0].start).toStrictEqual(w1.start);
      expect(merged[0].end).toStrictEqual(w2.end);
    });
  
    it('leaves non‑overlapping windows separate', () => {
      const w1 = { start: new Date(0), end: new Date(5) };
      const w2 = { start: new Date(6), end: new Date(8) };
      const merged = mergeTimeWindows([w1, w2]);
      expect(merged).toHaveLength(2);
    });
  });