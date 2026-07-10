interface CodeBlockProps {
  label: string;
  code?: string;
}

export function CodeBlock({ label, code }: CodeBlockProps) {
  if (!code) {
    return null;
  }

  return (
    <figure className="overflow-hidden rounded border border-line bg-[#101820]">
      <figcaption className="border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-normal text-[#b8c7c2]">
        {label}
      </figcaption>
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-[#eef7f2]">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
