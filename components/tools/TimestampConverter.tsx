"use client";

import { useMemo, useState } from "react";

import { parseTimestamp } from "../../lib/tools/timestamp";

export function TimestampConverter() {
  const [input, setInput] = useState("1704067200");
  const result = useMemo(() => parseTimestamp(input), [input]);

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium text-ink">
        Timestamp
        <input className="rounded border border-line bg-white px-3 py-2 font-mono" value={input} onChange={(event) => setInput(event.target.value)} />
      </label>
      <div className="rounded border border-line bg-white p-4">
        {result ? (
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-ink">Detected format</dt>
              <dd className="text-steel">{result.kind.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">UTC</dt>
              <dd className="font-mono text-steel">{result.utc}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Local</dt>
              <dd className="font-mono text-steel">{result.local}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-warn">Enter Unix seconds, Unix milliseconds, Windows FileTime, or ISO 8601.</p>
        )}
      </div>
    </div>
  );
}
