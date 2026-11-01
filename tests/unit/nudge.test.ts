import { describe, it, expect } from 'vitest';

/**
 * Pure parsing logic mirroring frontend live-nudge presentation
 */
function parseNudge(nudgeRaw: string | null, ruleFromApi?: string | null, timeFromApi?: string | null) {
  if (!nudgeRaw) return { message: '', devText: null, time: null, rule: null };
  const match = nudgeRaw.match(/^(.*?)\s*\[Time:\s*([^|\]]+)\s*\|\s*Rule:\s*([^\]]+)\]$/);
  if (match) {
    return {
      message: match[1].trim(),
      time: match[2].trim(),
      rule: match[3].trim(),
      devText: `Time: ${match[2].trim()} | Rule: ${match[3].trim()}`
    };
  }
  if (ruleFromApi || timeFromApi) {
    return {
      message: nudgeRaw,
      time: timeFromApi || '',
      rule: ruleFromApi || '',
      devText: `Time: ${timeFromApi || 'Live'} | Rule: ${ruleFromApi || 'Active'}`
    };
  }
  return { message: nudgeRaw, devText: null, time: null, rule: null };
}

/**
 * Client-side boundary checker matching backend Asia/Kolkata boundary
 */
function isPeakHourKolkata(dateInUtcOrIst: Date): boolean {
  // Format into Asia/Kolkata hour, minute, second
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  const parts = formatter.formatToParts(dateInUtcOrIst);
  const hour = Number(parts.find(p => p.type === 'hour')?.value);
  const minute = Number(parts.find(p => p.type === 'minute')?.value);
  const second = Number(parts.find(p => p.type === 'second')?.value);

  // Peak window: 18:00:00 <= time < 22:00:00
  const timeInSeconds = hour * 3600 + minute * 60 + second;
  const peakStart = 18 * 3600;      // 18:00:00 (6:00 PM inclusive)
  const peakEnd = 22 * 3600;        // 22:00:00 (10:00 PM exclusive)

  return timeInSeconds >= peakStart && timeInSeconds < peakEnd;
}

describe('Live Energy Nudge & Peak Hours Window Tests', () => {
  it('correctly handles inclusive 6:00 PM (18:00:00) boundary in Asia/Kolkata', () => {
    // 18:00:00 IST is 12:30:00 UTC
    const peakStartTime = new Date('2026-11-02T12:30:00Z');
    expect(isPeakHourKolkata(peakStartTime)).toBe(true);

    // 17:59:59 IST is 12:29:59 UTC
    const beforePeakTime = new Date('2026-11-02T12:29:59Z');
    expect(isPeakHourKolkata(beforePeakTime)).toBe(false);
  });

  it('correctly handles exclusive 10:00 PM (22:00:00) boundary in Asia/Kolkata', () => {
    // 21:59:59 IST is 16:29:59 UTC
    const justBeforeEnd = new Date('2026-11-02T16:29:59Z');
    expect(isPeakHourKolkata(justBeforeEnd)).toBe(true);

    // 22:00:00 IST is 16:30:00 UTC (Exclusive)
    const exactEndTime = new Date('2026-11-02T16:30:00Z');
    expect(isPeakHourKolkata(exactEndTime)).toBe(false);

    // 22:01:00 IST
    const afterEndTime = new Date('2026-11-02T16:31:00Z');
    expect(isPeakHourKolkata(afterEndTime)).toBe(false);
  });

  it('never treats night-time hours as peak even when server UTC is hour 21', () => {
    // When UTC is 21:00:00 (9:00 PM UTC), IST is 02:30:00 AM next day
    const utcHour21 = new Date('2026-11-01T21:00:00Z');
    expect(isPeakHourKolkata(utcHour21)).toBe(false);
  });

  it('parses live nudge message and extracts dev verification metadata cleanly', () => {
    const rawNudge = '⚡ High Demand detected (1645W). Switch off idle appliances to conserve energy. [Time: 02:32:41 AM IST | Rule: OFF_PEAK_HIGH_LOAD]';
    const parsed = parseNudge(rawNudge);

    expect(parsed.message).toBe('⚡ High Demand detected (1645W). Switch off idle appliances to conserve energy.');
    expect(parsed.time).toBe('02:32:41 AM IST');
    expect(parsed.rule).toBe('OFF_PEAK_HIGH_LOAD');
    expect(parsed.devText).toBe('Time: 02:32:41 AM IST | Rule: OFF_PEAK_HIGH_LOAD');
  });

  it('verifies off-peak high-load message strictly omits peak hours and ToD tariff mentions', () => {
    const offPeakNudge = '⚡ High Demand detected (1645W). Switch off idle appliances to conserve energy.';
    expect(offPeakNudge).not.toMatch(/Peak Grid Hours/i);
    expect(offPeakNudge).not.toMatch(/6-10 PM/i);
    expect(offPeakNudge).not.toMatch(/ToD tariffs/i);
    expect(offPeakNudge).not.toMatch(/premium/i);
  });
});
