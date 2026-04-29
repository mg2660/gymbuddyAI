const userTimeZone = "Asia/Calcutta";

function parseDateString(dateString: string) {
  return new Date(`${dateString}T00:00:00Z`);
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: userTimeZone,
    ...options,
  }).format(date);
}

export function getCurrentUserDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: userTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getUserDateStringFromTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: userTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

export function shiftDateString(dateString: string, amount: number) {
  const next = parseDateString(dateString);
  next.setUTCDate(next.getUTCDate() + amount);
  return next.toISOString().slice(0, 10);
}

export function getDateRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  let cursor = startDate;

  while (cursor <= endDate) {
    dates.push(cursor);
    cursor = shiftDateString(cursor, 1);
  }

  return dates;
}

export function getDatesBetweenExclusive(startDate: string, endDate: string) {
  if (startDate >= endDate) {
    return [];
  }

  const first = shiftDateString(startDate, 1);
  const last = shiftDateString(endDate, -1);

  if (first > last) {
    return [];
  }

  return getDateRange(first, last);
}

export function getRecentDateStrings(days: number, endDate = getCurrentUserDateString()) {
  const dates: string[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    dates.push(shiftDateString(endDate, -index));
  }

  return dates;
}

export function getShortWeekdayLabel(dateString: string) {
  return formatDate(parseDateString(dateString), {
    weekday: "short",
  });
}

export function getShortMonthDayLabel(dateString: string) {
  return formatDate(parseDateString(dateString), {
    month: "short",
    day: "numeric",
  });
}

export function getMonthYearLabel(dateString: string) {
  return formatDate(parseDateString(dateString), {
    month: "long",
    year: "numeric",
  });
}

export function getDayNumberLabel(dateString: string) {
  return formatDate(parseDateString(dateString), {
    day: "numeric",
  });
}

export function getRelativeTodayString(daysAgo: number) {
  return shiftDateString(getCurrentUserDateString(), -daysAgo);
}
