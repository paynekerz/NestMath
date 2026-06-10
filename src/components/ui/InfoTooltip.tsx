import { useState, useId, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  text: string;
}

export function InfoTooltip({ text }: Props) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const id = useId();
  const btnRef = useRef<HTMLButtonElement>(null);

  function updatePos() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.top, left: r.left + r.width / 2 });
  }

  const show = () => { updatePos(); setVisible(true); };
  const hide = () => setVisible(false);

  useEffect(() => {
    if (!visible) return;
    const close = () => setVisible(false);
    window.addEventListener('scroll', close, { passive: true, capture: true });
    window.addEventListener('resize', close, { passive: true });
    return () => {
      window.removeEventListener('scroll', close, { capture: true });
      window.removeEventListener('resize', close);
    };
  }, [visible]);

  const tooltip = (
    <span
      id={id}
      role="tooltip"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        transform: 'translate(-50%, calc(-100% - 8px))',
        zIndex: 9999,
      }}
      className="w-56 rounded-xl bg-surface-container border border-border-subtle text-body-sm text-on-surface px-3 py-2 shadow-lg pointer-events-none"
    >
      {text}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-subtle" />
    </span>
  );

  return (
    <span className="inline-flex items-center">
      <button
        ref={btnRef}
        type="button"
        aria-label="More information"
        aria-describedby={id}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={e => e.key === 'Escape' && hide()}
        className="flex items-center justify-center w-3.5 h-3.5 text-outline hover:text-primary transition-colors cursor-help shrink-0"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-full h-full" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="5.5" r="1" fill="currentColor" />
          <rect x="7" y="8" width="2" height="4" rx="1" fill="currentColor" />
        </svg>
      </button>
      {visible && createPortal(tooltip, document.body)}
    </span>
  );
}
