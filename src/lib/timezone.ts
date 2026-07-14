export function getStartOfDayInTimezone(timezone: string): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateStr = formatter.format(now); // YYYY-MM-DD
  return new Date(`${dateStr}T00:00:00`);
}

export function getEndOfDayInTimezone(timezone: string): Date {
  const start = getStartOfDayInTimezone(timezone);
  start.setHours(23, 59, 59, 999);
  return start;
}

export function formatDateInTimezone(
  date: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return date.toLocaleString("en-US", {
    timeZone: timezone,
    ...options,
  });
}
