import { verifyProductionSite } from "../lib/production-verification";

function readArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const fetchOrigin = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
  if (!fetchOrigin) {
    throw new Error("Usage: npm run verify:production -- <https-origin> [--canonical-origin <https-origin>]");
  }

  const result = await verifyProductionSite(fetchOrigin, {
    canonicalOrigin: readArgument("--canonical-origin"),
  });

  for (const check of result.checks) {
    console.log(`${check.passed ? "PASS" : "FAIL"} ${check.name}: ${check.detail}`);
  }

  if (!result.passed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
