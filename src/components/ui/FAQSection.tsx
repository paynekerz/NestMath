export interface FAQItem {
  q: string;
  a: string;
}

interface Props {
  items: FAQItem[];
}

export function FAQSection({ items }: Props) {
  return (
    <section aria-label="Frequently asked questions" className="flex flex-col gap-2">
      <h2 className="text-label-md font-semibold text-primary uppercase tracking-widest mb-xs">FAQ</h2>
      {items.map((item, i) => (
        <details key={i} className="group rounded-xl border border-border-subtle bg-surface-elevated">
          <summary className="cursor-pointer list-none flex items-center justify-between px-lg py-sm text-body-sm font-medium text-on-surface select-none hover:bg-surface-container-high/30 transition-colors rounded-xl">
            {item.q}
            <span className="text-on-surface-variant text-label-sm ml-2 shrink-0 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <p className="px-lg pb-lg pt-xs text-body-sm text-on-surface-variant leading-relaxed border-t border-border-subtle">{item.a}</p>
        </details>
      ))}
    </section>
  );
}
