import { useState } from 'react';

export interface FAQItem {
  q: string;
  a: React.ReactNode;
  aText?: string;
}

interface Props {
  items: FAQItem[];
}

function jsxToText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(jsxToText).join('');
  if (typeof node === 'object') {
    const el = node as React.ReactElement;
    if (el.props) return jsxToText(el.props.children);
  }
  return '';
}

function FAQItemRow({ q, a }: FAQItem) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-elevated">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-lg py-sm text-body-sm font-medium text-on-surface select-none hover:bg-surface-container-high/30 transition-colors rounded-xl"
      >
        {q}
        <span className={`text-on-surface-variant text-label-sm ml-2 shrink-0 transition-transform duration-300 ease-in-out ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="px-lg pb-lg pt-xs text-body-sm text-on-surface-variant leading-relaxed border-t border-border-subtle">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection({ items }: Props) {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.aText ?? jsxToText(item.a),
      },
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <section aria-label="Frequently asked questions" className="flex flex-col gap-2">
        <h2 className="text-label-md font-semibold text-primary uppercase tracking-widest mb-xs">FAQ</h2>
        {items.map((item, i) => (
          <FAQItemRow key={i} q={item.q} a={item.a} />
        ))}
      </section>
    </>
  );
}
