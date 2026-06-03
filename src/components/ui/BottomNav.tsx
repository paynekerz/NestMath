import { useEffect, useState } from 'react';

const ITEMS = [
  { icon: 'home',                   label: 'Home',    href: '/',          disabled: false },
  { icon: 'function',               label: 'Solve',   href: '/buy-vs-rent', disabled: false },
  { icon: 'account_balance_wallet', label: 'Vault',   href: null,         disabled: true },
  { icon: 'person',                 label: 'Profile', href: null,         disabled: true },
];

export function BottomNav() {
  const [path, setPath] = useState('');

  useEffect(() => {
    setPath(window.location.pathname.replace(/\/$/, '') || '/');
  }, []);

  return (
    <nav
      data-print="hide"
      className="fixed bottom-0 inset-x-0 h-16 lg:hidden z-50 bg-surface-container-highest/95 backdrop-blur-md border-t border-border-subtle shadow-lg"
    >
      <div className="flex justify-around items-center h-full px-xs">
        {ITEMS.map(({ icon, label, href, disabled }) => {
          const active = !disabled && href !== null && (
            href === '/' ? path === '/' : path === href
          );

          const inner = (
            <span className="flex flex-col items-center gap-[2px]">
              <span
                className={
                  'material-symbols-outlined text-[22px] transition-all ' +
                  (active ? 'font-variation-[FILL:1]' : '')
                }
                style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 400" } : undefined}
              >
                {icon}
              </span>
              <span className="text-label-sm-mobile">{label}</span>
            </span>
          );

          const baseClass =
            'flex flex-col items-center justify-center min-w-[56px] h-full transition-all active:scale-90 ' +
            (disabled
              ? 'text-on-surface-variant/40 cursor-not-allowed'
              : active
              ? 'text-on-primary-container'
              : 'text-on-surface-variant hover:text-primary');

          if (disabled || !href) {
            return (
              <button key={icon} type="button" disabled className={baseClass}>
                {active ? (
                  <span className="bg-primary-container rounded-full px-4 py-1">{inner}</span>
                ) : (
                  inner
                )}
              </button>
            );
          }

          return (
            <a key={icon} href={href} className={baseClass}>
              {active ? (
                <span className="bg-primary-container rounded-full px-4 py-1">{inner}</span>
              ) : (
                inner
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
