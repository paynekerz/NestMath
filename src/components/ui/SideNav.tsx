interface SideNavProps {
  currentPath: string;
  toolName: string;
}

const TOOLS = [
  { href: '/buy-vs-rent',     icon: 'analytics',  label: 'Buy vs. Rent' },
  { href: '/affordability',   icon: 'payments',   label: 'Affordability' },
  { href: '/payoff',          icon: 'schedule',   label: 'Payoff' },
  { href: '/savings-planner', icon: 'savings',    label: 'Savings Planner' },
  { href: '/refinance',       icon: 'sync_alt',   label: 'Refinance' },
];

export function SideNav({ currentPath, toolName }: SideNavProps) {
  const normalized = currentPath.replace(/\/$/, '');

  return (
    <aside
      data-print="hide"
      className="hidden lg:flex flex-col fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-surface-container-low border-r border-border-subtle p-md z-30"
    >
      {/* Tool section label */}
      <p className="text-label-sm text-on-surface-variant uppercase tracking-widest mb-sm px-sm">
        {toolName}
      </p>

      {/* Nav items */}
      <nav className="flex flex-col gap-base flex-1">
        {TOOLS.map(({ href, icon, label }) => {
          const active = normalized === href;
          return (
            <a
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={
                'flex items-center gap-sm px-sm py-xs rounded-lg transition-colors text-body-sm ' +
                (active
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface')
              }
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </a>
          );
        })}
      </nav>

      {/* Support link */}
      <div className="mt-auto border-t border-border-subtle pt-md">
        <a
          href="https://ko-fi.com/paynekerz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-sm px-sm py-xs rounded-lg text-body-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">favorite</span>
          Support NestMath
        </a>
      </div>
    </aside>
  );
}
