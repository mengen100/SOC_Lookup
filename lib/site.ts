export const SITE_NAME = "SOC Event Lookup";
export const SITE_DESCRIPTION = "Structured Windows Security and Sysmon event ID reference for SOC analysts.";
export const DEFAULT_SITE_URL = "https://soc-event-lookup.vercel.app";

export function normalizeSiteUrl(value: string | undefined): string {
  return (value?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
