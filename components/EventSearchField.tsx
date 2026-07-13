"use client";

interface EventSearchFieldProps {
  id: string;
  label: string;
  placeholder: string;
  query: string;
  onQueryChange: (query: string) => void;
}

export function EventSearchField({ id, label, placeholder, query, onQueryChange }: EventSearchFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          autoComplete="off"
          className="h-12 w-full rounded border border-line bg-white px-4 pr-12 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-accent focus:ring-2 focus:ring-accent/15"
          id={id}
          inputMode="search"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          type="search"
          value={query}
        />
        {query ? (
          <button
            aria-label="Clear search"
            className="absolute right-1.5 top-1.5 h-9 w-9 rounded text-xl leading-none text-steel hover:bg-panel hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
            onClick={() => onQueryChange("")}
            title="Clear search"
            type="button"
          >
            &times;
          </button>
        ) : null}
      </div>
    </div>
  );
}
