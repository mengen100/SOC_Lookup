import type { MetadataRoute } from "next";

import { getCompleteEvents, getEventHref } from "../lib/events";
import { absoluteUrl } from "../lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/windows-events/",
    "/sysmon-events/",
    "/tools/",
    "/tools/timestamp-converter/",
    "/tools/sigma-converter/",
    "/tools/cvss-calculator/",
    "/about/",
    "/privacy-policy/",
    "/disclaimer/",
  ].map((route) => ({ url: absoluteUrl(route) }));

  const eventRoutes = getCompleteEvents().map((event) => ({
    url: absoluteUrl(getEventHref(event.source, event.id)),
    lastModified: new Date(event.last_reviewed),
  }));

  return [...staticRoutes, ...eventRoutes];
}
