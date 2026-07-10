import type { Metadata } from "next";

import { EventBrowser } from "../../components/EventBrowser";
import { getCategoriesForSource, getCompletedEventKeys, getSkeletonEvents } from "../../lib/events";

export const metadata: Metadata = {
  title: "Sysmon Event IDs",
  description: "Browse Sysmon event IDs with SOC-focused categories and completed guide status.",
  alternates: { canonical: "/sysmon-events/" },
};

export default function SysmonEventsPage() {
  const events = getSkeletonEvents().filter((event) => event.source === "sysmon");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold text-ink">Sysmon Event IDs</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-steel">
          Browse Sysmon telemetry events by category. Completed entries link to full investigation guides; unfinished entries stay visible without dead links.
        </p>
      </header>
      <EventBrowser events={events} categories={getCategoriesForSource("sysmon")} completedKeys={Array.from(getCompletedEventKeys())} />
    </div>
  );
}
