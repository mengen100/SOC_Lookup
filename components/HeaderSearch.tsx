export function HeaderSearch() {
  return (
    <form action="/" className="flex w-full min-w-0" method="get" role="search">
      <label className="sr-only" htmlFor="header-event-search">
        Search events
      </label>
      <input
        autoComplete="off"
        className="h-10 min-w-0 flex-1 rounded-l border border-r-0 border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-steel/70 focus:border-accent focus:ring-2 focus:ring-accent/15"
        id="header-event-search"
        name="q"
        placeholder="Search events, e.g. 4625"
        type="search"
      />
      <button
        className="h-10 shrink-0 whitespace-nowrap rounded-r border border-accent bg-accent px-4 text-sm font-semibold text-white hover:bg-[#085a4d] focus:outline-none focus:ring-2 focus:ring-accent/20"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}
