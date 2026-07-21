export type FetchLike = (url: string) => Promise<Pick<Response, "ok" | "status" | "text">>;

export type VerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type ProductionVerificationResult = {
  passed: boolean;
  checks: VerificationCheck[];
  errors: string[];
};

type VerificationOptions = {
  canonicalOrigin?: string;
  fetchImpl?: FetchLike;
};

const HTML_ROUTES = [
  "/",
  "/windows-events/4625/",
  "/sysmon-events/1/",
  "/tools/timestamp-converter/",
  "/tools/sigma-converter/",
  "/tools/cvss-calculator/",
] as const;

const REQUIRED_ROUTES = [
  ...HTML_ROUTES,
  "/robots.txt",
  "/sitemap.xml",
  "/api/events/index.json",
  "/api/events/windows-security/4625.json",
] as const;

function validateOrigin(value: string): string {
  const url = new URL(value);
  const hasExtraParts = url.pathname !== "/" || Boolean(url.search || url.hash || url.username || url.password);
  if (url.protocol !== "https:" || hasExtraParts) {
    throw new Error("Production URL must be an HTTPS origin without a path, query, hash, or credentials.");
  }
  return url.origin;
}

function canonicalUrl(origin: string, path: string): string {
  return new URL(path, `${origin}/`).toString();
}

export async function verifyProductionSite(
  fetchOriginValue: string,
  options: VerificationOptions = {},
): Promise<ProductionVerificationResult> {
  const fetchOrigin = validateOrigin(fetchOriginValue);
  const canonicalOrigin = validateOrigin(options.canonicalOrigin ?? fetchOriginValue);
  const fetchImpl = options.fetchImpl ?? fetch;
  const checks: VerificationCheck[] = [];
  const bodies = new Map<string, string>();

  const addCheck = (name: string, passed: boolean, detail: string) => {
    checks.push({ name, passed, detail });
  };

  await Promise.all(
    REQUIRED_ROUTES.map(async (path) => {
      try {
        const response = await fetchImpl(canonicalUrl(fetchOrigin, path));
        addCheck(`HTTP ${path}`, response.ok, response.ok ? `HTTP ${response.status}` : `Expected HTTP 200, received ${response.status}`);
        bodies.set(path, await response.text());
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        addCheck(`HTTP ${path}`, false, `Request failed: ${detail}`);
      }
    }),
  );

  for (const path of HTML_ROUTES) {
    const body = bodies.get(path) ?? "";
    const expectedUrl = canonicalUrl(canonicalOrigin, path);
    addCheck(
      `canonical ${path}`,
      body.includes(`<link rel="canonical" href="${expectedUrl}"`),
      `Expected canonical URL ${expectedUrl}`,
    );
    addCheck(
      `Open Graph ${path}`,
      body.includes(`<meta property="og:url" content="${expectedUrl}"`),
      `Expected Open Graph URL ${expectedUrl}`,
    );
  }

  const homepage = bodies.get("/") ?? "";
  addCheck("homepage WebSite JSON-LD", homepage.includes('"@type":"WebSite"'), "Expected WebSite structured data on the homepage");

  for (const path of ["/windows-events/4625/", "/sysmon-events/1/"]) {
    const body = bodies.get(path) ?? "";
    addCheck(`TechArticle ${path}`, body.includes('"@type":"TechArticle"'), "Expected TechArticle structured data");
    addCheck(`FAQPage ${path}`, body.includes('"@type":"FAQPage"'), "Expected FAQPage structured data");
    addCheck(`BreadcrumbList ${path}`, body.includes('"@type":"BreadcrumbList"'), "Expected BreadcrumbList structured data");
  }

  const sitemap = bodies.get("/sitemap.xml") ?? "";
  const sitemapCount = sitemap.match(/<url>/g)?.length ?? 0;
  const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  addCheck("sitemap URL count", sitemapCount === 118, `Expected 118 sitemap URLs, received ${sitemapCount}`);
  addCheck(
    "sitemap canonical origin",
    sitemapLocations.length === 118 && sitemapLocations.every((location) => location.startsWith(`${canonicalOrigin}/`)),
    `Expected every sitemap URL to use ${canonicalOrigin}`,
  );

  const robots = bodies.get("/robots.txt") ?? "";
  addCheck(
    "robots sitemap",
    robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`),
    `Expected robots.txt to reference ${canonicalOrigin}/sitemap.xml`,
  );

  try {
    const index = JSON.parse(bodies.get("/api/events/index.json") ?? "{}") as {
      event_count?: number;
      events?: Array<{ canonical_url?: string }>;
    };
    addCheck(
      "event index count",
      index.event_count === 108 && index.events?.length === 108,
      `Expected 108 exported events, received ${index.event_count ?? 0}`,
    );
    addCheck(
      "event index canonical origin",
      Boolean(index.events?.length) && index.events!.every((event) => event.canonical_url?.startsWith(`${canonicalOrigin}/`)),
      `Expected every event canonical_url to use ${canonicalOrigin}`,
    );
  } catch {
    addCheck("event index JSON", false, "Expected /api/events/index.json to contain valid JSON");
  }

  const allBodies = [...bodies.values()].join("\n");
  addCheck(
    "legacy Vercel hostname",
    !allBodies.includes("soc-event-lookup.vercel.app"),
    "Expected no legacy Vercel hostname in production output",
  );

  const errors = checks.filter((check) => !check.passed).map((check) => `${check.name}: ${check.detail}`);
  return { passed: errors.length === 0, checks, errors };
}
