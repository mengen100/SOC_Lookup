import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer for SOC Event Lookup.",
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-ink">Disclaimer</h1>
      <p className="mt-4 leading-7 text-steel">
        This site provides educational security reference material. Validate event interpretation against official documentation, your environment, and your organization&apos;s response procedures before taking action.
      </p>
    </div>
  );
}
