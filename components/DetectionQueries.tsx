import type { DetectionQuery, EventPageRecord } from "../lib/events";
import { CodeBlock } from "./CodeBlock";

const languageLabels: Record<DetectionQuery["language"], string> = {
  kql: "Microsoft Sentinel KQL",
  spl: "Splunk SPL",
  xql: "Cortex XQL",
  sigma: "Sigma rule",
};

export function DetectionQueries({ event }: Readonly<{ event: EventPageRecord }>) {
  if (event.queries && event.queries.length > 0) {
    return (
      <div className="grid gap-5">
        {event.queries.map((query) => (
          <article key={query.language} className="min-w-0">
            <CodeBlock label={`${languageLabels[query.language]}: ${query.title}`} code={query.query} />
            <dl className="mt-2 grid gap-2 px-1 text-sm sm:grid-cols-[8rem_1fr]">
              <dt className="font-semibold text-ink">Data source</dt>
              <dd>{query.data_source}</dd>
              <dt className="font-semibold text-ink">Assumptions</dt>
              <dd>{query.assumptions.length > 0 ? query.assumptions.join(" ") : "None documented."}</dd>
            </dl>
            {query.source_url ? (
              <a
                className="mt-2 inline-block px-1 text-sm text-accent underline underline-offset-4"
                href={query.source_url}
                rel="noreferrer"
                target="_blank"
              >
                Query reference
              </a>
            ) : null}
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <CodeBlock label="Microsoft Sentinel KQL" code={event.kql_snippet} />
      <CodeBlock label="Splunk SPL" code={event.spl_snippet} />
    </div>
  );
}
