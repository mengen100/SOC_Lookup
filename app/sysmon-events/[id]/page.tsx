import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventPage } from "../../../components/EventPage";
import { getCompleteEvents, getEventByRoute } from "../../../lib/events";
import { eventDescription } from "../../../lib/schema-org";

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

  return {
    title: `${event.name} (Event ID ${event.id}) - ${event.category}`,
    description: eventDescription(event),
    alternates: { canonical: `/sysmon-events/${event.id}/` },
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
