import { CodeBlock } from "./CodeBlock";
import { RelatedEvents } from "./RelatedEvents";
import { buildTechArticleJsonLd } from "../lib/schema-org";
import { sourceToRouteSlug, type EventPageRecord } from "../lib/events";

interface EventPageProps {
  event: EventPageRecord;
}

export function EventPage({ event }: EventPageProps) {
  const jsonLd = buildTechArticleJsonLd(event);

  return (
    <article className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-line pb-8">
        <div className="flex flex-wrap gap-2 text-sm text-steel">
          <span className="rounded border border-line bg-white px-2 py-1">Event ID {event.id}</span>
          <span className="rounded border border-line bg-white px-2 py-1">{event.category}</span>
          <span className="rounded border border-line bg-white px-2 py-1">{event.priority}</span>
        </div>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold text-ink sm:text-4xl">{event.name}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-steel">{event.definition}</p>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-ink">Applicable version</dt>
            <dd className="mt-1 text-steel">{event.applicable_version}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Last reviewed</dt>
            <dd className="mt-1 text-steel">{event.last_reviewed}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-8 py-8">
        <Section title="Trigger Scenarios">
          <p>{event.trigger_scenarios}</p>
        </Section>

        <Section title="Key Fields">
          <div className="grid gap-3">
            {event.key_fields.map((field) => (
              <div key={field.field} className="rounded border border-line bg-white p-4">
                <h3 className="font-semibold text-ink">{field.field}</h3>
                <p className="mt-2 text-sm leading-6 text-steel">{field.explanation}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Common False Positives">
          <ul className="grid gap-2">
            {event.false_positives.map((item) => (
              <li key={item} className="rounded border border-line bg-white px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Related Events">
          <RelatedEvents ids={event.related_event_ids} source={event.source} />
        </Section>

        <Section title="MITRE ATT&CK Mapping">
          {event.attck_mapping && event.attck_mapping.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-3">
              {event.attck_mapping.map((technique) => (
                <li key={technique.technique_id} className="rounded border border-line bg-white px-4 py-3 text-sm">
                  <span className="font-semibold text-ink">{technique.technique_id}</span>
                  <span className="mt-1 block text-steel">{technique.technique_name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reliable mapping listed.</p>
          )}
        </Section>

        <Section title="Detection Notes">
          <p>{event.detection_notes}</p>
        </Section>

        <div className="grid gap-4">
          <CodeBlock label="Microsoft Sentinel KQL" code={event.kql_snippet} />
          <CodeBlock label="Splunk SPL" code={event.spl_snippet} />
          <CodeBlock label="Sample Log" code={event.sample_log} />
        </div>

        <Section title="Source">
          <div className="flex flex-wrap gap-3">
            <a className="text-accent underline underline-offset-4" href={event.source_url} rel="noreferrer" target="_blank">
              Official documentation
            </a>
            <a className="text-accent underline underline-offset-4" href={getEventJsonUrl(event)}>
              Machine-readable JSON
            </a>
          </div>
        </Section>
      </div>
    </article>
  );
}

function getEventJsonUrl(event: EventPageRecord): string {
  const sourceFolder = sourceToRouteSlug(event.source) === "windows-events" ? "windows-security" : "sysmon";
  return `/api/events/${sourceFolder}/${event.id}.json`;
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 text-base leading-7 text-steel">{children}</div>
    </section>
  );
}
