import { describe, it, expect } from 'vitest';
import { getKolkataTimeInfo, resolveLiveNudge } from '../../src/services/nudgeService';

describe('Live Energy Nudge & Peak Hours Window Tests', () => {
  it('correctly handles inclusive 6:00 PM (18:00:00) boundary in Asia/Kolkata', () => {
    // 18:00:00 IST is 12:30:00 UTC
    const peakStartTime = new Date('2026-11-02T12:30:00Z');
    expect(getKolkataTimeInfo(peakStartTime).isPeak).toBe(true);

    // 17:59:59 IST is 12:29:59 UTC
    const beforePeakTime = new Date('2026-11-02T12:29:59Z');
    expect(getKolkataTimeInfo(beforePeakTime).isPeak).toBe(false);
  });

  it('correctly handles exclusive 10:00 PM (22:00:00) boundary in Asia/Kolkata', () => {
    // 21:59:59 IST is 16:29:59 UTC
    const justBeforeEnd = new Date('2026-11-02T16:29:59Z');
    expect(getKolkataTimeInfo(justBeforeEnd).isPeak).toBe(true);

    // 22:00:00 IST is 16:30:00 UTC (Exclusive)
    const exactEndTime = new Date('2026-11-02T16:30:00Z');
    expect(getKolkataTimeInfo(exactEndTime).isPeak).toBe(false);

    // 22:01:00 IST
    const afterEndTime = new Date('2026-11-02T16:31:00Z');
    expect(getKolkataTimeInfo(afterEndTime).isPeak).toBe(false);
  });

  it('never treats night-time hours as peak even when server UTC is hour 21', () => {
    // When UTC is 21:00:00 (9:00 PM UTC), IST is 02:30:00 AM next day
    const utcHour21 = new Date('2026-11-01T21:00:00Z');
    expect(getKolkataTimeInfo(utcHour21).isPeak).toBe(false);
  });

  it('resolves live wattage 2155W at 3:00 AM IST with neutral message without mentioning peak hours or tariffs', () => {
    // At current time (3:00 AM IST), 2155W load
    const result = resolveLiveNudge(
      "⚠️ HIGH LOAD WARNING: 2155W running during Peak Grid Hours (6-10 PM). Defer high-wattage cycles to avoid premium ToD tariffs.",
      2155,
      Date.now() / 1000
    );

    // At 3:00 AM, isPeak is false, so it must NOT claim peak hours
    expect(result.rule).toBe('OFF_PEAK_HIGH_LOAD');
    expect(result.message).toBe('⚡ High electricity usage detected (2155W). Switch off idle appliances to conserve energy.');
    expect(result.message).not.toMatch(/Peak Grid Hours/i);
    expect(result.message).not.toMatch(/6-10 PM/i);
    expect(result.message).not.toMatch(/ToD tariffs/i);
    expect(result.message).not.toMatch(/premium/i);
    expect(result.devText).toContain('Rule: OFF_PEAK_HIGH_LOAD');
  });

  it('correctly shows efficient grid draw for low wattage', () => {
    const result = resolveLiveNudge(null, 450, Date.now() / 1000);
    expect(result.rule).toBe('EFFICIENT_GRID_DRAW');
    expect(result.message).toBe('🟢 Efficient Grid Draw (450W). Optimal consumption profile.');
  });
});
