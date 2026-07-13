export function HeaderSearch() {
  return (
    <form action="/" className="flex w-full min-w-0 lg:mx-4 lg:max-w-sm" method="get" role="search">
      <label className="sr-only" htmlFor="header-event-search">
        Search events
      </label>
      <input
        autoComplete="off"
        className="h-9 min-w-0 flex-1 rounded-l border border-r-0 border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-steel/70 focus:border-accent"
        id="header-event-search"
        name="q"
        placeholder="Search events"
        type="search"
      />
      <button
        className="h-9 rounded-r border border-accent bg-accent px-3 text-sm font-semibold text-white hover:bg-[#085a4d] focus:outline-none focus:ring-2 focus:ring-accent/20"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}
