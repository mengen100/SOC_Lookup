import { sourceToRouteSlug, type EventPageRecord, type EventSourceReference } from "../lib/events";

export function EventSources({ event }: Readonly<{ event: EventPageRecord }>) {
  const sources = event.sources ?? [
    {
      title: "Official documentation",
      url: event.source_url,
      publisher: event.source === "sysmon" ? "Microsoft Sysinternals" : "Microsoft",
      source_type: "vendor" as const,
    },
  ];

  return (
    <div>
      <ul className="divide-y divide-line border-y border-line">
        {sources.map((source) => (
          <li key={source.url} className="py-4">
            <a className="font-semibold text-accent underline underline-offset-4" href={source.url} rel="noreferrer" target="_blank">
              {source.title}
            </a>
            <p className="mt-1 text-sm text-steel">{source.publisher} · {formatSourceType(source.source_type)}</p>
          </li>
        ))}
      </ul>
      <a className="mt-4 inline-block text-accent underline underline-offset-4" href={getEventJsonUrl(event)}>
        Machine-readable JSON
      </a>
    </div>
  );
}

function getEventJsonUrl(event: EventPageRecord): string {
  const sourceFolder = sourceToRouteSlug(event.source) === "windows-events" ? "windows-security" : "sysmon";
  return `/api/events/${sourceFolder}/${event.id}.json`;
}

function formatSourceType(sourceType: EventSourceReference["source_type"]): string {
  return sourceType.replace("-", " ");
}
