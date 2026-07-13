import type { Metadata } from "next";

import { EventBrowser } from "../../components/EventBrowser";
import { getCategoriesForSource, getCompleteEvents, getSkeletonEvents } from "../../lib/events";
import { buildEventSearchDocuments } from "../../lib/search";

export const metadata: Metadata = {
  title: "Windows Security Event IDs",
  description: "Browse Windows Security event IDs with SOC investigation guidance, key fields, ATT&CK mappings, KQL, and SPL.",
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
          Browse complete Windows Security event guides by category, with investigation context, key fields, false positives, ATT&CK mappings, KQL, and SPL.
        </p>
      </header>
      <EventBrowser events={events} categories={getCategoriesForSource("windows_security")} />
    </div>
  );
}
