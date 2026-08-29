// lib/quiz/countdown.ts
export function formatTimeUntil(targetDate: Date, now: Date = new Date()): string {
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) return "now";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return `${days}d ${hours}h ${minutes}m`;
}