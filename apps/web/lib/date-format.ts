export const MEXICO_TIME_ZONE = "America/Mexico_City";

function parseWallClockParts(dateValue: string | null | undefined) {
  if (!dateValue) {
    return null;
  }

  const match = String(dateValue).match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
  );

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] || 0)
  };
}

function hasExplicitTimeZone(dateValue: string) {
  return /(?:z|[+-]\d{2}:?\d{2})$/i.test(dateValue);
}

function getTimeZoneOffsetMs(date: Date, timeZone = MEXICO_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return asUtc - date.getTime();
}

export function mexicoLocalDateTimeToDate(dateValue: string | null | undefined) {
  const parts = parseWallClockParts(dateValue);

  if (!parts) {
    return dateValue ? new Date(dateValue) : null;
  }

  const rawValue = String(dateValue);

  if (hasExplicitTimeZone(rawValue)) {
    return new Date(rawValue);
  }

  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const firstOffset = getTimeZoneOffsetMs(new Date(utcGuess));
  const firstDate = new Date(utcGuess - firstOffset);
  const secondOffset = getTimeZoneOffsetMs(firstDate);

  return new Date(utcGuess - secondOffset);
}

export function mexicoLocalDateTimeToIso(dateValue: string | null | undefined) {
  const date = mexicoLocalDateTimeToDate(dateValue);
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

export function buildWallClockDate(dateValue: string | null | undefined) {
  return mexicoLocalDateTimeToDate(dateValue);
}

export function formatMexicoDate(dateValue: string | null | undefined) {
  const date = mexicoLocalDateTimeToDate(dateValue);

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeZone: MEXICO_TIME_ZONE
  }).format(date);
}

export function formatMexicoDateTime(dateValue: string | null | undefined) {
  const date = mexicoLocalDateTimeToDate(dateValue);

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: MEXICO_TIME_ZONE
  }).format(date);
}

export function formatMexicoDateTimeInput(dateValue: string | null | undefined) {
  const date = mexicoLocalDateTimeToDate(dateValue);

  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function getMexicoDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day)
  };
}

export function mexicoDayBoundaryIso(year: number, month: number, day: number, endOfDay = false) {
  const hour = endOfDay ? "23" : "00";
  const minute = endOfDay ? "59" : "00";
  const second = endOfDay ? "59" : "00";
  const millis = endOfDay ? ".999" : ".000";

  return mexicoLocalDateTimeToIso(
    `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}T${hour}:${minute}:${second}${millis}`
  );
}

export const formatEventDateWallClock = formatMexicoDate;
export const formatEventDateTimeWallClock = formatMexicoDateTime;
