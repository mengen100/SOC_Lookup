"use client";

import { useMemo, useState } from "react";

import { convertSigmaRule } from "../../lib/tools/sigma";

const example = `title: Failed logon burst
logsource:
  product: windows
detection:
  selection:
    EventID: 4625
    TargetUserName: admin
  condition: selection`;

export function SigmaConverter() {
  const [input, setInput] = useState(example);
  const result = useMemo(() => convertSigmaRule(input), [input]);

  return (
    <div className="grid gap-4">
      <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
        Sigma YAML
        <textarea className="min-h-64 w-full min-w-0 rounded border border-line bg-white px-3 py-2 font-mono text-sm" value={input} onChange={(event) => setInput(event.target.value)} />
      </label>
      {result.unsupportedReason ? (
        <div className="rounded border border-line bg-panel p-4 text-sm text-warn">{result.unsupportedReason}</div>
      ) : (
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <Output title="KQL" value={result.kql} />
          <Output title="SPL" value={result.spl} />
        </div>
      )}
    </div>
  );
}

function Output({ title, value }: { title: string; value: string }) {
  return (
    <figure className="min-w-0 rounded border border-line bg-[#101820]">
      <figcaption className="border-b border-white/10 px-4 py-2 text-xs font-semibold text-[#b8c7c2]">{title}</figcaption>
      <pre className="max-w-full overflow-x-auto p-4 text-sm text-[#eef7f2]">{value}</pre>
    </figure>
  );
}
