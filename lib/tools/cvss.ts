export type Cvss31Metrics = {
  AV: "N" | "A" | "L" | "P";
  AC: "L" | "H";
  PR: "N" | "L" | "H";
  UI: "N" | "R";
  S: "U" | "C";
  C: "H" | "L" | "N";
  I: "H" | "L" | "N";
  A: "H" | "L" | "N";
};

export interface CvssResult {
  score: number;
  severity: "None" | "Low" | "Medium" | "High" | "Critical";
  vector: string;
}

const weights = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  AC: { L: 0.77, H: 0.44 },
  UI: { N: 0.85, R: 0.62 },
  CIA: { H: 0.56, L: 0.22, N: 0 },
};

export function calculateCvss31(metrics: Cvss31Metrics): CvssResult {
  const scopeChanged = metrics.S === "C";
  const prWeight = getPrivilegeRequiredWeight(metrics.PR, scopeChanged);
  const exploitability = 8.22 * weights.AV[metrics.AV] * weights.AC[metrics.AC] * prWeight * weights.UI[metrics.UI];
  const impactSubScore = 1 - (1 - weights.CIA[metrics.C]) * (1 - weights.CIA[metrics.I]) * (1 - weights.CIA[metrics.A]);
  const impact = scopeChanged ? 7.52 * (impactSubScore - 0.029) - 3.25 * Math.pow(impactSubScore - 0.02, 15) : 6.42 * impactSubScore;
  const rawScore = impact <= 0 ? 0 : scopeChanged ? roundUp(Math.min(1.08 * (impact + exploitability), 10)) : roundUp(Math.min(impact + exploitability, 10));

  return {
    score: rawScore,
    severity: severityForScore(rawScore),
    vector: `CVSS:3.1/AV:${metrics.AV}/AC:${metrics.AC}/PR:${metrics.PR}/UI:${metrics.UI}/S:${metrics.S}/C:${metrics.C}/I:${metrics.I}/A:${metrics.A}`,
  };
}

function getPrivilegeRequiredWeight(value: Cvss31Metrics["PR"], scopeChanged: boolean): number {
  if (value === "N") return 0.85;
  if (value === "L") return scopeChanged ? 0.68 : 0.62;
  return scopeChanged ? 0.5 : 0.27;
}

function roundUp(value: number): number {
  return Math.ceil(value * 10) / 10;
}

function severityForScore(score: number): CvssResult["severity"] {
  if (score === 0) return "None";
  if (score < 4) return "Low";
  if (score < 7) return "Medium";
  if (score < 9) return "High";
  return "Critical";
}
