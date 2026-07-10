"use client";

import { useMemo, useState } from "react";

import { calculateCvss31, type Cvss31Metrics } from "../../lib/tools/cvss";

const defaults: Cvss31Metrics = {
  AV: "N",
  AC: "L",
  PR: "N",
  UI: "N",
  S: "U",
  C: "H",
  I: "H",
  A: "H",
};

const options: Record<keyof Cvss31Metrics, Array<[string, string]>> = {
  AV: [["N", "Network"], ["A", "Adjacent"], ["L", "Local"], ["P", "Physical"]],
  AC: [["L", "Low"], ["H", "High"]],
  PR: [["N", "None"], ["L", "Low"], ["H", "High"]],
  UI: [["N", "None"], ["R", "Required"]],
  S: [["U", "Unchanged"], ["C", "Changed"]],
  C: [["H", "High"], ["L", "Low"], ["N", "None"]],
  I: [["H", "High"], ["L", "Low"], ["N", "None"]],
  A: [["H", "High"], ["L", "Low"], ["N", "None"]],
};

export function CvssCalculator() {
  const [version, setVersion] = useState<"3.1" | "4.0">("3.1");
  const [metrics, setMetrics] = useState<Cvss31Metrics>(defaults);
  const result = useMemo(() => calculateCvss31(metrics), [metrics]);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5">
      <div className="flex w-full min-w-0 flex-wrap gap-2">
        {(["3.1", "4.0"] as const).map((item) => (
          <button
            key={item}
            className={`min-w-0 rounded border px-3 py-2 text-sm font-semibold ${version === item ? "border-accent bg-accent text-white" : "border-line bg-white text-ink"}`}
            type="button"
            onClick={() => setVersion(item)}
          >
            CVSS {item}
          </button>
        ))}
      </div>

      {version === "4.0" ? (
        <div className="rounded border border-line bg-panel p-4 text-sm leading-6 text-steel">
          CVSS 4.0 is exposed as a planned mode in this MVP, but the calculator intentionally does not output a score until the full FIRST formula is implemented and tested.
        </div>
      ) : (
        <>
          <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(options) as Array<keyof Cvss31Metrics>).map((key) => (
              <label key={key} className="grid min-w-0 gap-2 text-sm font-medium text-ink">
                {key}
                <select
                  className="w-full min-w-0 rounded border border-line bg-white px-3 py-2"
                  value={metrics[key]}
                  onChange={(event) => setMetrics((current) => ({ ...current, [key]: event.target.value } as Cvss31Metrics))}
                >
                  {options[key].map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="rounded border border-line bg-white p-5">
            <p className="text-4xl font-semibold text-ink">{result.score.toFixed(1)}</p>
            <p className="mt-1 text-sm font-semibold text-accent">{result.severity}</p>
            <p className="mt-3 break-words font-mono text-sm text-steel">{result.vector}</p>
          </div>
        </>
      )}
    </div>
  );
}
