/**
 * Mission LiFE Date & Time Utilities
 * Enforces IST (Asia/Kolkata) calendar date reckoning to eliminate UTC timezone drift.
 */

export function getIstDateString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

export function getIstYesterdayString(date = new Date()) {
  const istToday = getIstDateString(date);
  const [y, m, d] = istToday.split('-').map(Number);
  const yesterdayUtc = new Date(Date.UTC(y, m - 1, d) - 86400000);
  return yesterdayUtc.toISOString().split('T')[0];
}

export function getIstTomorrowString(date = new Date()) {
  const istToday = getIstDateString(date);
  const [y, m, d] = istToday.split('-').map(Number);
  const tomorrowUtc = new Date(Date.UTC(y, m - 1, d) + 86400000);
  return tomorrowUtc.toISOString().split('T')[0];
}

export function getIstDayDiff(olderDateStr, newerDateStr) {
  if (!olderDateStr || !newerDateStr) return Infinity;
  const [y1, m1, d1] = olderDateStr.split('-').map(Number);
  const [y2, m2, d2] = newerDateStr.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

