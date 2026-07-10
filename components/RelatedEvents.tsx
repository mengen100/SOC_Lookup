import Link from "next/link";

import { findSkeletonEvent, getCompletedEventKeys, getEventHref, type EventSource } from "../lib/events";

interface RelatedEventsProps {
  ids: string[];
  source: EventSource;
}

export function RelatedEvents({ ids, source }: RelatedEventsProps) {
  if (ids.length === 0) {
    return <p className="text-sm text-steel">No related events listed.</p>;
  }

  const completed = getCompletedEventKeys();

  return (
    <ul className="grid gap-2 sm:grid-cols-3">
      {ids.map((id) => {
        const skeleton = findSkeletonEvent(source, id);
        const isComplete = completed.has(`${source}:${id}`);
        const label = skeleton ? `${id} - ${skeleton.name}` : `Event ID ${id}`;
        return (
          <li key={id}>
            {isComplete ? (
              <Link className="block rounded border border-line bg-white px-3 py-2 text-sm hover:border-accent" href={getEventHref(source, id)}>
                {label}
              </Link>
            ) : (
              <span className="block rounded border border-line bg-panel px-3 py-2 text-sm text-steel">
                {label}
                <span className="mt-1 block text-xs">Content pending</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
