// src/lib/journal/today.ts
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000; // UTC+5, Pakistan has no DST

// The UTC instant that corresponds to 12:00 AM today in Pakistan time —
// works no matter what timezone the server itself runs in.
export function getPakistanDayStart(now: Date = new Date()) {
  const pktNow = new Date(now.getTime() + PKT_OFFSET_MS);
  const pktMidnight = new Date(
    Date.UTC(pktNow.getUTCFullYear(), pktNow.getUTCMonth(), pktNow.getUTCDate())
  );
  return new Date(pktMidnight.getTime() - PKT_OFFSET_MS);
}

export function getPakistanDayEnd(now: Date = new Date()) {
  return new Date(getPakistanDayStart(now).getTime() + 24 * 60 * 60 * 1000);
}