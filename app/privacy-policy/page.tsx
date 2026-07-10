import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for SOC Event Lookup.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-ink">Privacy Policy</h1>
      <p className="mt-4 leading-7 text-steel">
        This static MVP does not provide accounts, comments, or server-side data collection features. Hosting providers may collect standard access logs according to their own policies.
      </p>
    </div>
  );
}
