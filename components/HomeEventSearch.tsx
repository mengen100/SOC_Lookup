"use client";

import Link from "next/link";
import { useMemo } from "react";

import { EventSearchField } from "./EventSearchField";
import { useEventQuery } from "./useEventQuery";
import { searchEventDocuments, type EventSearchDocument } from "../lib/search";

interface HomeEventSearchProps {
  documents: EventSearchDocument[];
}

export function HomeEventSearch({ documents }: HomeEventSearchProps) {
  const { query, setQuery } = useEventQuery();
  const results = useMemo(() => query.trim() ? searchEventDocuments(documents, query).slice(0, 8) : [], [documents, query]);

  return (
    <section className="mt-8 max-w-3xl" aria-label="Event search">
      <EventSearchField
        id="home-event-search"
        label="Search the knowledge base"
        onQueryChange={setQuery}
        placeholder="Try 4625, failed logon, LogonType, or T1110"
        query={query}
      />
      {query.trim() ? (
        <div className="mt-3 overflow-hidden rounded border border-line bg-white" aria-live="polite">
          <p className="border-b border-line bg-panel px-4 py-2 text-xs font-semibold uppercase text-steel">
            {results.length > 0 ? `Top ${results.length} results` : "No matching events"}
          </p>
          {results.map((event) => (
            event.isComplete ? (
              <Link className="flex items-start justify-between gap-4 border-b border-line px-4 py-3 last:border-b-0 hover:bg-panel" href={event.href} key={`${event.source}:${event.id}`}>
                <span>
                  <span className="block font-semibold text-ink">{event.name}</span>
                  <span className="mt-1 block text-sm text-steel">{event.category} - {event.source === "windows_security" ? "Windows Security" : "Sysmon"}</span>
                </span>
                <span className="shrink-0 font-mono text-sm font-semibold text-accent">ID {event.id}</span>
              </Link>
            ) : null
          ))}
          {results.length === 8 ? (
            <p className="border-t border-line px-4 py-3 text-sm text-steel">
              Refine the query or browse a source collection to see more results.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
