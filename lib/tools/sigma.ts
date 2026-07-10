import yaml from "js-yaml";

interface SigmaRule {
  detection?: Record<string, unknown>;
}

export interface SigmaConversionResult {
  kql: string;
  spl: string;
  unsupportedReason?: string;
}

const fieldMap: Record<string, { kql: string; spl: string }> = {
  EventID: { kql: "EventID", spl: "EventCode" },
  TargetUserName: { kql: "TargetAccount", spl: "Account_Name" },
  AccountName: { kql: "Account", spl: "Account_Name" },
  Image: { kql: "Process", spl: "Image" },
  CommandLine: { kql: "CommandLine", spl: "CommandLine" },
  ParentImage: { kql: "ParentProcessName", spl: "ParentImage" },
  SourceIp: { kql: "IpAddress", spl: "Source_Network_Address" },
  SourceNetworkAddress: { kql: "IpAddress", spl: "Source_Network_Address" },
};

export function convertSigmaRule(input: string): SigmaConversionResult {
  let parsed: SigmaRule;
  try {
    parsed = yaml.load(input) as SigmaRule;
  } catch {
    return unsupported("该规则不是有效的YAML。");
  }

  const detection = parsed?.detection;
  const condition = typeof detection?.condition === "string" ? detection.condition.trim() : "";
  if (!detection || !condition) {
    return unsupported("该规则缺少detection.condition。");
  }

  if (!/^[A-Za-z0-9_]+$/.test(condition)) {
    return unsupported("该规则包含暂不支持的语法结构。");
  }

  const selection = detection[condition];
  if (!selection || typeof selection !== "object" || Array.isArray(selection)) {
    return unsupported("该规则的selection结构暂不支持。");
  }

  const entries = Object.entries(selection as Record<string, unknown>);
  const kqlParts: string[] = [];
  const splParts: string[] = [];

  for (const [sigmaField, rawValue] of entries) {
    const mapped = fieldMap[sigmaField];
    if (!mapped || Array.isArray(rawValue) || (typeof rawValue !== "string" && typeof rawValue !== "number")) {
      return unsupported("该规则包含暂不支持的语法结构。");
    }

    if (typeof rawValue === "number") {
      kqlParts.push(`${mapped.kql} == ${rawValue}`);
      splParts.push(`${mapped.spl}=${rawValue}`);
    } else {
      kqlParts.push(`${mapped.kql} == ${JSON.stringify(rawValue)}`);
      splParts.push(`${mapped.spl}=${JSON.stringify(rawValue)}`);
    }
  }

  return {
    kql: `SecurityEvent\n| where ${kqlParts.join(" and ")}`,
    spl: `index=wineventlog ${splParts.join(" ")}`,
  };
}

function unsupported(reason: string): SigmaConversionResult {
  return { kql: "", spl: "", unsupportedReason: reason };
}
