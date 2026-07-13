import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventPage } from "../../../components/EventPage";
import { getCompleteEvents, getEventByRoute } from "../../../lib/events";
import { eventDescription, eventPageTitle } from "../../../lib/schema-org";
import { SITE_NAME } from "../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCompleteEvents()
    .filter((event) => event.source === "sysmon")
    .map((event) => ({ id: event.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = getEventByRoute("sysmon-events", id);
  if (!event) {
    return {};
  }

  const title = eventPageTitle(event);
  const description = eventDescription(event);
  const canonical = `/sysmon-events/${event.id}/`;

  return {
    title,
    description,
    alternates: { canonical: `/sysmon-events/${event.id}/` },
    openGraph: { type: "article", title, description, url: canonical, siteName: SITE_NAME, locale: "en_US" },
    twitter: { card: "summary", title, description },
  };
}

export default async function SysmonEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEventByRoute("sysmon-events", id);
  if (!event) {
    notFound();
  }

  return <EventPage event={event} />;
}
