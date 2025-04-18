import { convertToLocal, convertToUTC } from "@/lib/db-service-notifications";

describe('UTC ↔ Local conversion helpers', () => {
  it('round‑trips UTC → local → UTC with no drift', () => {
    const nowUtc = new Date('2025-04-18T12:34:56Z');
    const local = convertToLocal(nowUtc);
    const backUtc = convertToUTC(local);
    expect(backUtc.toISOString()).toBe(nowUtc.toISOString());
  });
});