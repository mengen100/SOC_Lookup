import assert from "node:assert/strict";
import test from "node:test";

import { getCompleteEvents, getSkeletonEvents } from "../lib/events";
import { buildEventSearchDocuments, searchEventDocuments } from "../lib/search";

const documents = buildEventSearchDocuments(getSkeletonEvents(), getCompleteEvents());

test("ranks an exact event ID match first", () => {
  const results = searchEventDocuments(documents, "4625");

  assert.equal(results[0]?.id, "4625");
  assert.equal(results[0]?.source, "windows_security");
});

test("searches ATT&CK techniques and event source aliases", () => {
  const results = searchEventDocuments(documents, "sysmon T1055");

  assert.equal(results.some((event) => event.source === "sysmon" && event.id === "8"), true);
});

test("searches key field names from complete event records", () => {
  const results = searchEventDocuments(documents, "4625 Sub Status");

  assert.equal(results[0]?.id, "4625");
});

test("matches field names with or without separators", () => {
  const results = searchEventDocuments(documents, "LogonType");

  assert.equal(results.some((event) => event.id === "4625"), true);
});

test("requires every query token to match the same event", () => {
  const results = searchEventDocuments(documents, "kerberos ticket");

  assert.equal(results.length > 0, true);
  assert.equal(results.every((event) => event.searchText.includes("kerberos") && event.searchText.includes("ticket")), true);
});
