"use client";

import { useMemo, useState } from "react";

import { EventCard } from "./EventCard";
import type { SkeletonEvent } from "../lib/events";

interface EventBrowserProps {
  events: SkeletonEvent[];
  categories: string[];
  completedKeys: string[];
}

export function EventBrowser({ events, categories, completedKeys }: EventBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const completed = useMemo(() => new Set(completedKeys), [completedKeys]);
  const filtered = activeCategory === "All" ? events : events.filter((event) => event.category === activeCategory);

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {["All", ...categories].map((category) => (
          <button
            key={category}
            type="button"
            className={`rounded border px-3 py-1.5 text-sm ${activeCategory === category ? "border-accent bg-accent text-white" : "border-line bg-white text-steel"}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <EventCard key={`${event.source}:${event.id}`} event={event} isComplete={completed.has(`${event.source}:${event.id}`)} />
        ))}
      </div>
    </>
  );
}
