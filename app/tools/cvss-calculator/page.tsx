import { CvssCalculator } from "../../../components/tools/CvssCalculator";
import { buildPageMetadata } from "../../../lib/site";

export const metadata = buildPageMetadata({
  title: "CVSS Calculator",
  description: "Calculate CVSS 3.1 base scores in the browser.",
  path: "/tools/cvss-calculator/",
});

export default function CvssCalculatorPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-ink">CVSS Calculator</h1>
      <p className="mt-3 text-base leading-7 text-steel">Calculate CVSS 3.1 base scores locally. CVSS 4.0 is shown as a mode but intentionally not scored in this MVP.</p>
      <div className="mt-8">
        <CvssCalculator />
      </div>
    </div>
  );
}
