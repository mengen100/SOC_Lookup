import Link from "next/link";

import { HomeEventSearch } from "../components/HomeEventSearch";
import { getCompleteEvents, getSkeletonEvents } from "../lib/events";
import { buildWebsiteJsonLd } from "../lib/schema-org";
import { buildEventSearchDocuments } from "../lib/search";

const entryPoints = [
  { href: "/windows-events/", label: "Windows Events", description: "Security log event IDs" },
  { href: "/sysmon-events/", label: "Sysmon Events", description: "Sysmon operational log events" },
  { href: "/tools/", label: "Tools", description: "Timestamp, Sigma, CVSS" }
];

export default function HomePage() {
  const skeleton = getSkeletonEvents();
  const complete = getCompleteEvents();
  const searchDocuments = buildEventSearchDocuments(skeleton, complete);
  const websiteJsonLd = buildWebsiteJsonLd();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Windows Security &amp; Sysmon event reference</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          Look up any Windows Security or Sysmon event ID.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-steel">
          Definitions, trigger scenarios, key fields, false positives, related events, and SIEM starter queries, sourced and reviewed.
        </p>

        <div className="mt-6 max-w-3xl">
          <HomeEventSearch documents={searchDocuments} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {entryPoints.map((entry) => (
            <Link
              className="flex min-w-[9.5rem] flex-1 flex-col rounded border border-line bg-white px-4 py-3 text-sm hover:border-accent focus-visible:outline-accent sm:flex-none sm:basis-56"
              href={entry.href}
              key={entry.href}
            >
              <span className="font-semibold text-ink">{entry.label}</span>
              <span className="mt-0.5 text-xs text-steel">{entry.description}</span>
            </Link>
          ))}
        </div>

        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 text-sm">
          <div className="flex items-baseline gap-1.5">
            <dt className="text-xs uppercase tracking-wide text-steel/80">Indexed IDs</dt>
            <dd className="font-semibold text-ink">{skeleton.length}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-xs uppercase tracking-wide text-steel/80">Full guides</dt>
            <dd className="font-semibold text-ink">{complete.length}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-xs uppercase tracking-wide text-steel/80">Sources</dt>
            <dd className="font-semibold text-ink">2</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <dl className="grid gap-6 sm:grid-cols-3">
          {[
            ["Official-source first", "Every full page is built around source links, review dates, and explicit version context."],
            ["Machine-readable by design", "Schema-backed JSON, JSON-LD, stable canonical URLs, and predictable routing."],
            ["Detection oriented", "Entries include KQL, SPL, key fields, false positives, and related event pivots."]
          ].map(([title, body]) => (
            <div key={title}>
              <dt className="font-semibold text-ink">{title}</dt>
              <dd className="mt-1.5 text-sm leading-6 text-steel">{body}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
