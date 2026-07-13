import { EventBrowser } from "../../components/EventBrowser";
import { getCategoriesForSource, getCompleteEvents, getSkeletonEvents } from "../../lib/events";
import { buildEventSearchDocuments } from "../../lib/search";
import { buildPageMetadata } from "../../lib/site";

export const metadata = buildPageMetadata({
  title: "Sysmon Event IDs",
  description: "Browse Sysmon event IDs with SOC investigation guidance, key fields, ATT&CK mappings, KQL, and SPL.",
  path: "/sysmon-events/",
});

export default function SysmonEventsPage() {
  const events = buildEventSearchDocuments(getSkeletonEvents(), getCompleteEvents())
    .filter((event) => event.source === "sysmon");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold text-ink">Sysmon Event IDs</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-steel">
          Browse complete Sysmon event guides by category, with investigation context, key fields, false positives, ATT&CK mappings, KQL, and SPL.
        </p>
      </header>
      <EventBrowser events={events} categories={getCategoriesForSource("sysmon")} />
    </div>
  );
}
