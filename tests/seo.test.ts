import assert from "node:assert/strict";
import test from "node:test";

import { absoluteUrl, normalizeSiteUrl, SITE_URL } from "../lib/site";

test("normalizes the configured site origin", () => {
  assert.equal(normalizeSiteUrl("https://example.com/"), "https://example.com");
  assert.equal(normalizeSiteUrl(undefined), "https://soc-event-lookup.vercel.app");
  assert.equal(SITE_URL, normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL));
  assert.equal(absoluteUrl("/windows-events/4625/"), `${SITE_URL}/windows-events/4625/`);
});
