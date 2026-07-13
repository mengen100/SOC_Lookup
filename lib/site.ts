import type { Metadata } from "next";

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

export function buildPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const socialTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description,
    },
  };
}
