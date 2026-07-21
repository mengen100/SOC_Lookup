import type { EventPageRecord } from "../lib/events";

export function EventMetadataTable({ event }: Readonly<{ event: EventPageRecord }>) {
  if (!event.technical_metadata) {
    return null;
  }

  const attackMappings = event.attck_mapping?.map(formatAttackMapping).join("; ") || "No reliable mapping listed";
  const keyFields = event.key_fields.map((field) => field.field).join(", ");
  const rows = [
    ["Event ID", event.id],
    ["Provider", event.technical_metadata.provider],
    ["Channel", event.technical_metadata.channel],
    ["Level", event.technical_metadata.level],
    ...(event.technical_metadata.audit_keyword
      ? [["Audit keyword", event.technical_metadata.audit_keyword]]
      : []),
    ["MITRE ATT&CK", attackMappings],
    ["Key fields to watch", keyFields],
  ];

  return (
    <div className="min-w-0 max-w-full overflow-x-auto rounded border border-line bg-white">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">Technical metadata for Event ID {event.id}</caption>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-line last:border-b-0">
              <th className="w-44 bg-[#f6f8f4] px-4 py-3 align-top font-semibold text-ink" scope="row">
                {label}
              </th>
              <td className="px-4 py-3 leading-6 text-steel">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatAttackMapping(mapping: NonNullable<EventPageRecord["attck_mapping"]>[number]): string {
  const tactic = mapping.tactic_id && mapping.tactic_name ? `${mapping.tactic_id} ${mapping.tactic_name} / ` : "";
  return `${tactic}${mapping.technique_id} ${mapping.technique_name}`;
}
