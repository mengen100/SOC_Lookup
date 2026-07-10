export interface TimestampResult {
  kind: "unix_seconds" | "unix_milliseconds" | "windows_filetime" | "iso_8601";
  utc: string;
  local: string;
}

const FILETIME_EPOCH_OFFSET_MS = 11644473600000;

export function parseTimestamp(input: string): TimestampResult | undefined {
  const value = input.trim();
  if (!value) {
    return undefined;
  }

  const numeric = Number(value);
  if (/^\d+$/.test(value) && Number.isFinite(numeric)) {
    if (value.length >= 17) {
      return resultFromDate(new Date(numeric / 10000 - FILETIME_EPOCH_OFFSET_MS), "windows_filetime");
    }

    if (value.length >= 13) {
      return resultFromDate(new Date(numeric), "unix_milliseconds");
    }

    return resultFromDate(new Date(numeric * 1000), "unix_seconds");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return resultFromDate(date, "iso_8601");
}

function resultFromDate(date: Date, kind: TimestampResult["kind"]): TimestampResult | undefined {
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return {
    kind,
    utc: date.toISOString(),
    local: date.toLocaleString(),
  };
}
