import type { Metadata } from "next";

import { EventBrowser } from "../../components/EventBrowser";
import { getCategoriesForSource, getCompleteEvents, getSkeletonEvents } from "../../lib/events";
import { buildEventSearchDocuments } from "../../lib/search";

export const metadata: Metadata = {
  title: "Windows Security Event IDs",
  description: "Browse Windows Security event IDs with SOC-focused categories and completed guide status.",
  alternates: { canonical: "/windows-events/" },
};

export default function WindowsEventsPage() {
  const events = buildEventSearchDocuments(getSkeletonEvents(), getCompleteEvents())
    .filter((event) => event.source === "windows_security");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold text-ink">Windows Security Event IDs</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-steel">
          Browse Windows Security audit events by category. Completed entries link to full investigation guides; unfinished entries remain visible as content pipeline items.
        </p>
      </header>
      <EventBrowser events={events} categories={getCategoriesForSource("windows_security")} />
    </div>
  );
}
