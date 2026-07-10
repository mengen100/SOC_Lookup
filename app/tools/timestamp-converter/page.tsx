import type { Metadata } from "next";

import { TimestampConverter } from "../../../components/tools/TimestampConverter";

export const metadata: Metadata = {
  title: "Timestamp Converter",
  description: "Convert Unix seconds, Unix milliseconds, Windows FileTime, and ISO 8601 timestamps.",
};

export default function TimestampConverterPage() {
  return (
    <ToolShell title="Timestamp Converter" description="Convert common timestamps during event review without calling a backend service.">
      <TimestampConverter />
    </ToolShell>
  );
}

function ToolShell({ title, description, children }: Readonly<{ title: string; description: string; children: React.ReactNode }>) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-3 text-base leading-7 text-steel">{description}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
