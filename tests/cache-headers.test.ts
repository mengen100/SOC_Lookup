import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const headersPath = path.resolve(__dirname, "..", "public", "_headers");

test("defines safe Cloudflare Pages cache policies", () => {
  assert.equal(fs.existsSync(headersPath), true, "public/_headers must exist");

  const headers = fs.readFileSync(headersPath, "utf8");
  assert.match(headers, /\/_next\/static\/\*\s+Cache-Control: public, max-age=31536000, immutable/);
  assert.match(headers, /\/icon\.svg\s+Cache-Control: public, max-age=86400/);
  assert.match(headers, /\/api\/events\/\*\s+Cache-Control: public, max-age=3600, stale-while-revalidate=86400/);
  assert.doesNotMatch(headers, /^\/\*\r?\n\s+Cache-Control: public, max-age=31536000/m);
});
