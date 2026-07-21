import { Breadcrumbs } from "./Breadcrumbs";
import { CodeBlock } from "./CodeBlock";
import { DetectionQueries } from "./DetectionQueries";
import { EventFaq } from "./EventFaq";
import { EventMetadataTable } from "./EventMetadataTable";
import { EventSources } from "./EventSources";
import { EventValueTable } from "./EventValueTable";
import { RelatedEvents } from "./RelatedEvents";
import { buildEventStructuredData, eventPageTitle } from "../lib/schema-org";
import type { EventPageRecord } from "../lib/events";

interface EventPageProps {
  event: EventPageRecord;
}

export function EventPage({ event }: EventPageProps) {
  const structuredData = buildEventStructuredData(event);

  return (
    <article className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Breadcrumbs event={event} />
      <header>
        <div className="flex flex-wrap gap-2 text-sm text-steel">
          <span className="rounded border border-line bg-white px-2 py-1">Event ID {event.id}</span>
          <span className="rounded border border-line bg-white px-2 py-1">{event.category}</span>
          <span className="rounded border border-line bg-white px-2 py-1">{event.priority}</span>
        </div>
        <h1 className="mt-4 max-w-4xl break-words text-3xl font-semibold text-ink sm:text-4xl">{eventPageTitle(event)}</h1>
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

      <section id="quick-summary" className="mt-8 border-y border-line py-6">
        <h2 className="sr-only">Quick summary</h2>
        <p className="max-w-3xl text-lg leading-8 text-steel">{event.definition}</p>
      </section>

      <div className="grid gap-8 py-8">
        {event.technical_metadata ? (
          <Section title="Technical Metadata">
            <EventMetadataTable event={event} />
          </Section>
        ) : null}

        <Section title="Trigger Scenarios">
          <p>{event.trigger_scenarios}</p>
        </Section>

        <Section title="Key Fields">
          <div className="grid gap-3">
            {event.key_fields.map((field) => (
              <div key={field.field} className="min-w-0 rounded border border-line bg-white p-4">
                <h3 className="break-words font-semibold text-ink">{field.field}</h3>
                <p className="mt-2 text-sm leading-6 text-steel">{field.explanation}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Threat Hunting Queries">
          <DetectionQueries event={event} />
        </Section>

        {event.value_references && event.value_references.length > 0 ? (
          <Section title="Documented Values and Codes">
            <EventValueTable values={event.value_references} />
          </Section>
        ) : null}

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

        <Section title="Common False Positives">
          <ul className="grid gap-2">
            {event.false_positives.map((item) => (
              <li key={item} className="border-b border-line py-3 last:border-b-0">
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Related Events">
          <RelatedEvents ids={event.related_event_ids} source={event.source} />
        </Section>

        <Section title="Sample Log">
          <CodeBlock label="Sanitized event sample" code={event.sample_log} />
        </Section>

        {event.faqs && event.faqs.length > 0 ? (
          <Section title="Frequently Asked Questions">
            <EventFaq faqs={event.faqs} />
          </Section>
        ) : null}

        <Section title="Sources">
          <EventSources event={event} />
        </Section>
      </div>
    </article>
  );
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 break-words text-base leading-7 text-steel">{children}</div>
    </section>
  );
}
