import type { Metadata } from "next";

import { SigmaConverter } from "../../../components/tools/SigmaConverter";

export const metadata: Metadata = {
  title: "Sigma Converter",
  description: "Convert simple Sigma rule selections to starter KQL and SPL.",
  alternates: { canonical: "/tools/sigma-converter/" },
};

export default function SigmaConverterPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-ink">Sigma Converter</h1>
      <p className="mt-3 text-base leading-7 text-steel">Convert simple Sigma detection selections into starter KQL and SPL. Unsupported conditions are flagged instead of guessed.</p>
      <div className="mt-8">
        <SigmaConverter />
      </div>
    </div>
  );
}
