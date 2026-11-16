import type { EventSource } from "./events";

interface InvestigationExample {
  title: string;
  observation: string;
  steps: ReadonlyArray<{
    text: string;
    link?: { id: string; label: string };
  }>;
  limit: string;
}

const windowsExamples: Readonly<Partial<Record<string, InvestigationExample>>> = {
  "4624": {
    title: "Trace a network logon to an administrative share",
    observation: "Illustrative records: FS01 logs 4624 with LogonType 3 and TargetLogonId 0x541f35. Later, FS01 logs ADMIN$ access with SubjectLogonId 0x541f35.",
    steps: [
      { text: "Match the two IDs on FS01 in the same boot session. Check the New Logon account and available source address against approved administration hosts.", link: { id: "5140", label: "5140: first share access in the session" } },
      { text: "Use the share access check to narrow the investigation to a relative path and requested rights. Look for separate evidence of an actual file change.", link: { id: "5145", label: "5145: target path and requested rights" } },
    ],
    limit: "Logon Type 3 alone does not identify SMB. Do not join matching logon IDs from different hosts, and do not infer a transfer from the share check alone.",
  },
  "4771": {
    title: "Separate stale credentials from possible password spraying",
    observation: "Illustrative records: a domain controller logs Status 0x18 every minute for one service account after password rotation. In a separate case, one observed client address produces 0x18 for several accounts.",
    steps: [
      { text: "Group failures across the collected domain controllers by account, client address, and time. Check the first pattern against a known service or task and the rotation record; identify the actual clients behind the second pattern before concluding one device was responsible." },
      { text: "Look for a later successful TGT request (Status 0x0) for an affected account and client. Use account, client address when present, and time to correlate; search the destination host separately for successful logon.", link: { id: "4768", label: "4768: Kerberos TGT issuance" } },
      { text: "Where a lockout is reported, compare its timing with the failures instead of treating every 0x18 as a lockout.", link: { id: "4740", label: "4740: account lockout" } },
    ],
    limit: "These patterns are investigation leads, not volume thresholds. The event does not reveal the attempted password, and a TGT does not prove the client reached a target host.",
  },
  "5140": {
    title: "Check whether SMB share access led to a file write",
    observation: "Illustrative records: FS01 logs a 5140 for ADMIN$, followed by a 5145 for Temp\\agent.exe with AccessMask 0x2 in the same logon session.",
    steps: [
      { text: "Confirm the session on FS01 by matching the share event's SubjectLogonId to the successful network logon's TargetLogonId.", link: { id: "4624", label: "4624: destination-host network logon" } },
      { text: "Use the relative target name and share backing path to identify the candidate file. The mask 0x2 alone only describes the right requested in 5145.", link: { id: "5145", label: "5145: detailed share access check" } },
      { text: "Look for the write right being used on the matching local path in file-system auditing or for endpoint file telemetry. Verify audit policy and the file's audit settings before interpreting an absent record.", link: { id: "4663", label: "4663: audited use of an object access right" } },
    ],
    limit: "Neither 5140 nor a granted 5145 proves a file transfer completed or a binary ran. An approved deployment can produce the same access pattern.",
  },
};

export function getInvestigationExample(source: EventSource, id: string) {
  return source === "windows_security" && Object.hasOwn(windowsExamples, id) ? windowsExamples[id] : undefined;
}
