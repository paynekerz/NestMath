import { useRef, useEffect } from 'react';

export function usePrintChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function beforePrint() {
      const el = ref.current;
      if (!el) return;
      const container = el.querySelector<HTMLElement>('.recharts-responsive-container');
      const svg = el.querySelector<SVGSVGElement>('.recharts-wrapper > svg');
      if (!container || !svg) return;

      const cloned = svg.cloneNode(true) as SVGSVGElement;
      cloned.style.cssText = 'width:100%;height:auto;max-width:100%;display:block;';
      cloned.setAttribute('data-print-svg', '');

      container.style.display = 'none';
      container.parentNode!.insertBefore(cloned, container.nextSibling);
    }

    function afterPrint() {
      const el = ref.current;
      if (!el) return;
      el.querySelector('[data-print-svg]')?.remove();
      const container = el.querySelector<HTMLElement>('.recharts-responsive-container');
      if (container) container.style.display = '';
    }

    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  return ref;
}
