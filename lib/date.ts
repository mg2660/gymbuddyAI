const userTimeZone = "Asia/Calcutta";

export function getCurrentUserDateString() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: userTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}
