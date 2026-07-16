"use client";

import { useMemo, useState } from "react";

import { EventCard } from "./EventCard";
import { EventSearchField } from "./EventSearchField";
import { useEventQuery } from "./useEventQuery";
import { searchEventDocuments, type EventSearchDocument } from "../lib/search";

interface EventBrowserProps {
  events: EventSearchDocument[];
  categories: string[];
}

export function EventBrowser({ events, categories }: EventBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { query, setQuery } = useEventQuery();
  const filtered = useMemo(() => {
    const categoryEvents = activeCategory === "All" ? events : events.filter((event) => event.category === activeCategory);
    return searchEventDocuments(categoryEvents, query);
  }, [activeCategory, events, query]);

  return (
    <>
      <div className="mt-7 max-w-2xl">
        <EventSearchField
          id="collection-event-search"
          label="Search this collection"
          onQueryChange={setQuery}
          placeholder="Search by ID, name, field, status code, or ATT&CK technique"
          query={query}
        />
      </div>
      <div className="mt-6 border-t border-line pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-steel/80">Filter by category</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              className={`whitespace-nowrap rounded border px-3.5 py-2 text-sm font-medium transition ${activeCategory === category ? "border-accent bg-accent text-white" : "border-line bg-white text-steel hover:border-accent hover:text-ink"}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 border-t border-line pt-3">
        <p className="text-sm text-steel" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "event" : "events"} found
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <EventCard key={`${event.source}:${event.id}`} event={event} isComplete={event.isComplete} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="mt-8 border-y border-line py-10 text-center">
          <h2 className="text-lg font-semibold text-ink">No matching events</h2>
          <p className="mt-2 text-sm text-steel">Try an event ID, a shorter keyword, or another category.</p>
        </div>
      ) : null}
    </>
  );
}
