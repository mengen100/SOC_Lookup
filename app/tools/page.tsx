import Link from "next/link";
import { buildPageMetadata } from "../../lib/site";

export const metadata = buildPageMetadata({
  title: "SOC Tools",
  description: "Lightweight front-end tools for timestamp conversion, Sigma conversion, and CVSS scoring.",
  path: "/tools/",
});

const tools = [
  { href: "/tools/timestamp-converter/", title: "Timestamp Converter", body: "Detect Unix, Windows FileTime, and ISO 8601 timestamps." },
  { href: "/tools/sigma-converter/", title: "Sigma Converter", body: "Convert simple Sigma selections to KQL and SPL starters." },
  { href: "/tools/cvss-calculator/", title: "CVSS Calculator", body: "Calculate CVSS 3.1 base scores, with 4.0 marked for a later formula pass." },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-ink">SOC Tools</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="rounded border border-line bg-white p-5 hover:border-accent focus-visible:outline-accent">
            <h2 className="font-semibold text-ink">{tool.title}</h2>
            <p className="mt-2 text-sm leading-6 text-steel">{tool.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
