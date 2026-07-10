import fs from "node:fs";
import path from "node:path";

import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";

import schema from "../data/event-page-schema.json";

function createValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

function formatValidationError(filePath: string, error: ErrorObject): string {
  if (error.keyword === "required") {
    const missing = (error.params as { missingProperty?: string }).missingProperty;
    return `${filePath}: missing required field "${missing}"`;
  }

  const field = error.instancePath ? error.instancePath.slice(1).replaceAll("/", ".") : "record";
  return `${filePath}: ${field} ${error.message ?? "is invalid"}`;
}

export function validateEventRecord(record: unknown, filePath: string): string[] {
  const validate = createValidator();
  const valid = validate(record);
  if (valid) {
    return [];
  }

  return (validate.errors ?? []).map((error) => formatValidationError(filePath, error));
}

export function validateAllEventFiles(rootDir = path.join(process.cwd(), "data", "events")): string[] {
  if (!fs.existsSync(rootDir)) {
    return [`${rootDir}: event data directory does not exist`];
  }

  const errors: string[] = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (!entry.isFile() || !entry.name.endsWith(".json")) {
        continue;
      }

      try {
        const record = JSON.parse(fs.readFileSync(fullPath, "utf8")) as unknown;
        errors.push(...validateEventRecord(record, fullPath));
      } catch (error) {
        errors.push(`${fullPath}: ${error instanceof Error ? error.message : "could not parse JSON"}`);
      }
    }
  }

  return errors;
}

if (require.main === module) {
  const errors = validateAllEventFiles();
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log("Event data validation passed.");
}
