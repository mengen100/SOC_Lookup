import type { EventFaq as EventFaqItem } from "../lib/events";

export function EventFaq({ faqs }: Readonly<{ faqs?: EventFaqItem[] }>) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className="border-y border-line">
      {faqs.map((faq) => (
        <article key={faq.question} className="border-b border-line py-5 last:border-b-0">
          <h3 className="font-semibold text-ink">{faq.question}</h3>
          <p className="mt-2 leading-7 text-steel">{faq.answer}</p>
        </article>
      ))}
    </div>
  );
}
