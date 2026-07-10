import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About the SOC Event Lookup knowledge base.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-ink">About</h1>
      <p className="mt-4 leading-7 text-steel">
        SOC Event Lookup is a static reference for Windows Security and Sysmon event IDs. The project focuses on structured, source-backed event knowledge that can help analysts and future automation workflows.
      </p>
    </div>
  );
}
