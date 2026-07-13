"use client";

import { useCallback, useEffect, useState } from "react";

export function useEventQuery() {
  const [query, setQueryState] = useState("");

  useEffect(() => {
    const syncFromUrl = () => {
      setQueryState(new URLSearchParams(window.location.search).get("q") ?? "");
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);

    const url = new URL(window.location.href);
    if (value.trim()) {
      url.searchParams.set("q", value);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return { query, setQuery };
}
