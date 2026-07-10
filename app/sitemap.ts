import type { MetadataRoute } from "next";

import { getCompleteEvents, getEventHref } from "../lib/events";

const SITE_URL = "https://soc-event-lookup.vercel.app";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/windows-events/", "/sysmon-events/", "/tools/", "/about/", "/privacy-policy/", "/disclaimer/"].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const eventRoutes = getCompleteEvents().map((event) => ({
    url: `${SITE_URL}${getEventHref(event.source, event.id)}`,
    lastModified: new Date(event.last_reviewed),
  }));

  return [...staticRoutes, ...eventRoutes];
}
