import Link from "next/link";

import type { EventPageRecord } from "../lib/events";

export function Breadcrumbs({ event }: { event: EventPageRecord }) {
  const collectionHref = event.source === "windows_security" ? "/windows-events/" : "/sysmon-events/";
  const collectionName = event.source === "windows_security" ? "Windows Events" : "Sysmon Events";

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-steel">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link className="hover:text-accent" href="/">Home</Link></li>
        <li aria-hidden="true">/</li>
        <li><Link className="hover:text-accent" href={collectionHref}>{collectionName}</Link></li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">Event ID {event.id}</li>
      </ol>
    </nav>
  );
}
