import type { EventValueReference } from "../lib/events";

export function EventValueTable({ values }: Readonly<{ values?: EventValueReference[] }>) {
  if (!values || values.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-auto rounded border border-line bg-white">
      <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
        <caption className="sr-only">Documented event values and their security relevance</caption>
        <thead className="bg-[#f6f8f4] text-ink">
          <tr>
            <th className="px-4 py-3 font-semibold" scope="col">Field</th>
            <th className="px-4 py-3 font-semibold" scope="col">Value</th>
            <th className="px-4 py-3 font-semibold" scope="col">Meaning</th>
            <th className="px-4 py-3 font-semibold" scope="col">Security relevance</th>
          </tr>
        </thead>
        <tbody>
          {values.map((reference) => (
            <tr key={`${reference.field}:${reference.value}`} className="border-t border-line align-top">
              <th className="px-4 py-3 font-semibold text-ink" scope="row">{reference.field}</th>
              <td className="px-4 py-3 font-mono text-ink">{reference.value}</td>
              <td className="px-4 py-3 leading-6 text-steel">{reference.meaning}</td>
              <td className="px-4 py-3 leading-6 text-steel">
                {reference.security_relevance}{" "}
                <a
                  className="text-accent underline underline-offset-4"
                  href={reference.source_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Source
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
