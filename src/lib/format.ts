// src/lib/format.ts
// Small date/label helpers used by server components (server-only rendering,
// so no hydration concerns).

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const shortDateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return dateFmt.format(new Date(date));
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return shortDateFmt.format(new Date(date));
}

export function formatWeekRange(start: Date | string, end: Date | string): string {
  const s = new Date(start);
  const e = new Date(end);
  e.setDate(e.getDate() - 1); // weekEnd is exclusive — display the last covered day
  const sameYear = s.getFullYear() === e.getFullYear();
  const startStr = sameYear
    ? shortDateFmt.format(s)
    : dateFmt.format(s);
  return `${startStr} – ${dateFmt.format(e)}`;
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function timeOfDayGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
