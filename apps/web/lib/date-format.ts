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

export function buildWallClockDate(dateValue: string | null | undefined) {
  const parts = parseWallClockParts(dateValue);

  if (!parts) {
    return dateValue ? new Date(dateValue) : null;
  }

  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

export function formatEventDateWallClock(dateValue: string | null | undefined) {
  const date = buildWallClockDate(dateValue);

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium"
  }).format(date);
}

export function formatEventDateTimeWallClock(dateValue: string | null | undefined) {
  const date = buildWallClockDate(dateValue);

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
