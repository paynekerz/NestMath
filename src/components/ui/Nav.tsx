interface NavProps {
  currentPath: string;
}

const TOOL_LINKS = [
  { href: '/buy-vs-rent',     label: 'Buy vs. Rent' },
  { href: '/affordability',   label: 'Affordability' },
  { href: '/payoff',          label: 'Payoff' },
  { href: '/savings-planner', label: 'Savings Planner' },
  { href: '/refinance',       label: 'Refinance' },
];

export function Nav({ currentPath }: NavProps) {
  const normalized = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');

  return (
    <nav
      data-print="hide"
      className="sticky top-0 z-40 h-16 bg-surface/95 backdrop-blur-sm border-b border-border-subtle flex items-center"
    >
      <div className="max-w-[1280px] mx-auto w-full px-gutter flex items-center justify-between gap-lg">
        {/* Left: wordmark + tool links */}
        <div className="flex items-center gap-lg">
          <a
            href="/"
            className="text-headline-md font-bold text-primary tracking-tight shrink-0"
          >
            NestMath
          </a>
          <div className="hidden md:flex items-center gap-lg">
            {TOOL_LINKS.map(({ href, label }) => {
              const active = normalized === href;
              return (
                <a
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'text-body-sm font-medium transition-colors pb-1 ' +
                    (active
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary')
                  }
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Right: icon buttons + CTA */}
        <div className="flex items-center gap-xs">
          <button
            type="button"
            aria-label="Notifications"
            className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-xs rounded-lg hover:bg-surface-container-high"
          >
            notifications
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-xs rounded-lg hover:bg-surface-container-high"
          >
            settings
          </button>
          <a
            href="/"
            className="ml-xs bg-primary-container text-on-primary-container px-md py-xs rounded-lg text-label-md font-semibold hover:brightness-110 transition-all active:scale-95"
          >
            Calculate
          </a>
        </div>
      </div>
    </nav>
  );
}
