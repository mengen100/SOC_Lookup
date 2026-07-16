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

const commonInvestigations = [
  { href: "/windows-events/4625/", label: "Failed logons", description: "Authentication failures and account lockouts" },
  { href: "/windows-events/4688/", label: "Process creation", description: "New processes recorded by Windows Security" },
  { href: "/windows-events/4104/", label: "PowerShell activity", description: "Script block logging and suspicious commands" },
  { href: "/windows-events/4769/", label: "Kerberos service tickets", description: "TGS requests and ticket anomalies" },
  { href: "/sysmon-events/1/", label: "Sysmon process creation", description: "Command lines, hashes, and parent processes" }
];

export default function HomePage() {
  const skeleton = getSkeletonEvents();
  const complete = getCompleteEvents();
  const searchDocuments = buildEventSearchDocuments(skeleton, complete);
  const websiteJsonLd = buildWebsiteJsonLd();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <section className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(15rem,1fr)] lg:items-start">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Windows Security &amp; Sysmon event reference</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Look up any Windows Security or Sysmon event ID.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-steel">
            Definitions, trigger scenarios, key fields, false positives, related events, and SIEM starter queries, sourced and reviewed.
          </p>

          <div className="mt-6">
            <HomeEventSearch documents={searchDocuments} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {entryPoints.map((entry) => (
              <Link
                className="flex min-w-0 flex-col rounded border border-line bg-white px-4 py-3 text-sm hover:border-accent focus-visible:outline-accent"
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
        </div>

        <aside className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1" aria-labelledby="common-investigations-title">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel/80">Investigation shortcuts</p>
          <h2 className="mt-2 text-lg font-semibold text-ink" id="common-investigations-title">Common investigations</h2>
          <p className="mt-2 text-sm leading-6 text-steel">Jump directly to core SOC reference topics.</p>
          <nav className="mt-4" aria-labelledby="common-investigations-title">
            {commonInvestigations.map((investigation) => (
              <Link
                className="group block border-t border-line py-3 last:border-b hover:text-accent"
                href={investigation.href}
                key={investigation.href}
              >
                <span className="block text-sm font-semibold text-ink group-hover:text-accent">{investigation.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-steel">{investigation.description}</span>
              </Link>
            ))}
          </nav>
        </aside>
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
