import assert from "node:assert/strict";
import test from "node:test";

import { calculateCvss31 } from "../lib/tools/cvss";
import { convertSigmaRule } from "../lib/tools/sigma";
import { parseTimestamp } from "../lib/tools/timestamp";

test("parses Unix seconds, Unix milliseconds, Windows FileTime, and ISO timestamps", () => {
  assert.equal(parseTimestamp("1704067200")?.utc, "2024-01-01T00:00:00.000Z");
  assert.equal(parseTimestamp("1704067200000")?.utc, "2024-01-01T00:00:00.000Z");
  assert.equal(parseTimestamp("133485408000000000")?.utc, "2024-01-01T00:00:00.000Z");
  assert.equal(parseTimestamp("2024-01-01T00:00:00Z")?.utc, "2024-01-01T00:00:00.000Z");
});

test("converts simple Sigma selections to KQL and SPL", () => {
  const result = convertSigmaRule(`
title: Failed logon burst
logsource:
  product: windows
detection:
  selection:
    EventID: 4625
    TargetUserName: admin
  condition: selection
`);

  assert.equal(result.unsupportedReason, undefined);
  assert.match(result.kql, /EventID == 4625/);
  assert.match(result.kql, /TargetAccount == "admin"/);
  assert.match(result.spl, /EventCode=4625/);
  assert.match(result.spl, /Account_Name="admin"/);
});

test("refuses unsupported Sigma conditions instead of emitting misleading output", () => {
  const result = convertSigmaRule(`
detection:
  selection_one:
    EventID: 4625
  selection_two:
    EventID: 4624
  condition: selection_one or selection_two
`);

  assert.match(result.unsupportedReason ?? "", /unsupported syntax/);
});

test("calculates CVSS 3.1 base score and severity", () => {
  const result = calculateCvss31({
    AV: "N",
    AC: "L",
    PR: "N",
    UI: "N",
    S: "U",
    C: "H",
    I: "H",
    A: "H",
  });

  assert.equal(result.score, 9.8);
  assert.equal(result.severity, "Critical");
});
