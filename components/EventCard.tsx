import Link from "next/link";

import type { SkeletonEvent } from "../lib/events";

interface EventCardProps {
  event: SkeletonEvent;
  isComplete: boolean;
}

export function EventCard({ event, isComplete }: EventCardProps) {
  const content = (
    <article className="h-full rounded border border-line bg-white p-4 transition hover:border-accent">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-accent">Event ID {event.id}</p>
          <h2 className="mt-1 text-base font-semibold text-ink">{event.name}</h2>
        </div>
        <span className="rounded border border-line px-2 py-1 text-xs font-semibold text-steel">{event.priority}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-steel">
        <span className="rounded bg-panel px-2 py-1">{event.category}</span>
        <span className="rounded bg-panel px-2 py-1">{event.source === "windows_security" ? "Windows Security" : "Sysmon"}</span>
      </div>
      {event.notes ? <p className="mt-3 text-sm leading-6 text-steel">{event.notes}</p> : null}
      <p className="mt-4 text-sm font-medium text-accent">{isComplete ? "Open event guide" : "Content pending"}</p>
    </article>
  );

  return isComplete ? <Link href={getBrowserSafeEventHref(event)}>{content}</Link> : content;
}

function getBrowserSafeEventHref(event: SkeletonEvent): string {
  const basePath = event.source === "windows_security" ? "windows-events" : "sysmon-events";
  return `/${basePath}/${event.id}/`;
}
