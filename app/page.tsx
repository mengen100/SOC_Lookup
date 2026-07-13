import Link from "next/link";

import { HomeEventSearch } from "../components/HomeEventSearch";
import { getCompleteEvents, getSkeletonEvents } from "../lib/events";
import { buildWebsiteJsonLd } from "../lib/schema-org";
import { buildEventSearchDocuments } from "../lib/search";

export default function HomePage() {
  const skeleton = getSkeletonEvents();
  const complete = getCompleteEvents();
  const searchDocuments = buildEventSearchDocuments(skeleton, complete);
  const websiteJsonLd = buildWebsiteJsonLd();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <section className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-accent">Windows Security and Sysmon knowledge base</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Structured event ID reference for SOC investigations.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">
            Look up event definitions, trigger scenarios, false-positive notes, key fields, related events, official sources, and SIEM starter queries.
          </p>
          <HomeEventSearch documents={searchDocuments} />
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white" href="/windows-events/">
              Browse Windows Events
            </Link>
            <Link className="rounded border border-line bg-white px-4 py-2 text-sm font-semibold text-ink" href="/sysmon-events/">
              Browse Sysmon Events
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 rounded border border-line bg-white p-4">
          <Metric label="Indexed IDs" value={skeleton.length.toString()} />
          <Metric label="Full Guides" value={complete.length.toString()} />
          <Metric label="Sources" value="2" />
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          ["Official-source first", "Every full page is built around source links, review dates, and explicit version context."],
          ["Machine-readable by design", "Schema-backed JSON, JSON-LD, stable canonical URLs, and predictable routing."],
          ["Detection oriented", "Entries include KQL, SPL, key fields, false positives, and related event pivots."]
        ].map(([title, body]) => (
          <article key={title} className="rounded border border-line bg-white p-5">
            <h2 className="font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-steel">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-steel">{label}</p>
    </div>
  );
}
