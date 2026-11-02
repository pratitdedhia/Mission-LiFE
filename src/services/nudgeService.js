/**
 * Mission LiFE - Smart Meter Live Nudge & Tariff Window Evaluator
 * 
 * Rules:
 * - Timezone: Asia/Kolkata (IST = UTC+05:30)
 * - Peak Grid Window: 6:00 PM (18:00:00 inclusive) to 10:00 PM (22:00:00 exclusive)
 * - PEAK_HIGH_LOAD: In peak window AND wattage > 1200W
 * - OFF_PEAK_HIGH_LOAD: Outside peak window AND wattage > 1200W
 *   Neutral message: "High electricity usage detected"
 *   STRICTLY omits: "Peak Grid Hours", "6-10 PM", "premium ToD tariffs", "peak tariffs"
 * - EFFICIENT_GRID_DRAW: wattage <= 1200W
 */

export function getKolkataTimeInfo(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const hour = Number(parts.find(p => p.type === 'hour')?.value || 0);
  const minute = Number(parts.find(p => p.type === 'minute')?.value || 0);
  const second = Number(parts.find(p => p.type === 'second')?.value || 0);

  // Peak window: 18:00:00 <= time < 22:00:00 (Inclusive at 18:00, Exclusive at 22:00)
  const timeInSeconds = hour * 3600 + minute * 60 + second;
  const isPeak = timeInSeconds >= 18 * 3600 && timeInSeconds < 22 * 3600;

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
  const timeString = timeFormatter.format(date) + ' IST';

  return { isPeak, hour, minute, second, timeString };
}

export function resolveLiveNudge(rawNudge, watts, timestamp) {
  // Evaluate against provided timestamp (or current live time) in Asia/Kolkata
  const dateObj = timestamp ? (typeof timestamp === 'number' ? new Date(timestamp > 1e11 ? timestamp : timestamp * 1000) : new Date(timestamp)) : new Date();
  const timeInfo = getKolkataTimeInfo(dateObj);
  const wattage = Number(watts) || 0;
  const isHighWattage = wattage > 1200;

  let cleanMsg = '';
  let rule = '';

  if (timeInfo.isPeak) {
    if (isHighWattage) {
      rule = 'PEAK_HIGH_LOAD';
      cleanMsg = `⚠️ HIGH LOAD WARNING: ${wattage.toFixed(0)}W running during Peak Grid Hours (6-10 PM). Defer high-wattage cycles to avoid premium ToD tariffs.`;
    } else {
      rule = 'EFFICIENT_GRID_DRAW';
      cleanMsg = `🟢 Efficient Grid Draw (${wattage.toFixed(0)}W). Optimal consumption profile.`;
    }
  } else {
    // Outside peak window: Neutral high usage message without mentioning peak hours or peak tariffs
    if (isHighWattage) {
      rule = 'OFF_PEAK_HIGH_LOAD';
      cleanMsg = `⚡ High electricity usage detected (${wattage.toFixed(0)}W). Switch off idle appliances to conserve energy.`;
    } else {
      rule = 'EFFICIENT_GRID_DRAW';
      cleanMsg = `🟢 Efficient Grid Draw (${wattage.toFixed(0)}W). Optimal consumption profile.`;
    }
  }

  return {
    message: cleanMsg,
    rule,
    time: timeInfo.timeString,
    devText: `Time: ${timeInfo.timeString} | Rule: ${rule}`
  };
}

