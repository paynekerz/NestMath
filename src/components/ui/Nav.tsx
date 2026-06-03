interface Tool {
  href: string;
  label: string;
  desc: string;
}

const HOME_TOOLS: Tool[] = [
  { href: '/buy-vs-rent',     label: 'Buy vs. Rent',     desc: 'Should I buy or rent?' },
  { href: '/affordability',   label: 'Affordability',    desc: 'How much house can I afford?' },
  { href: '/payoff',          label: 'Payoff',           desc: 'What if I pay extra each month?' },
  { href: '/savings-planner', label: 'Savings Planner',  desc: 'How long until I can afford to buy?' },
  { href: '/refinance',       label: 'Refinance',        desc: 'Is refinancing worth it?' },
];

const LIFE_TOOLS: Tool[] = [
  { href: '/raise-vs-job-hop',  label: 'Raise vs. Job Hop',  desc: 'Should I stay or switch jobs?' },
  { href: '/renovation-roi',    label: 'Renovation ROI',     desc: 'Is renovating worth it?' },
  { href: '/car-lease-vs-buy',  label: 'Car Lease vs. Buy',  desc: 'Should I lease or buy a car?' },
  { href: '/investment-fees',   label: 'Investment Fees',    desc: 'How much do fees cost me?' },
  { href: '/effective-hourly',  label: 'Effective Hourly',   desc: 'What am I actually making?' },
  { href: '/hysa-calculator',   label: 'HYSA Calculator',    desc: 'How much will my savings earn?' },
];

function ToolDropdown({
  label,
  tools,
  normalized,
}: {
  label: string;
  tools: Tool[];
  normalized: string;
}) {
  const groupActive = tools.some((t) => normalized === t.href);
  return (
    <div className="relative group">
      <button
        type="button"
        className={
          'flex items-center gap-0.5 text-body-sm font-medium transition-colors pb-1 ' +
          (groupActive
            ? 'text-primary border-b-2 border-primary'
            : 'text-on-surface-variant hover:text-primary')
        }
      >
        {label}
        <span className="material-symbols-outlined text-[16px] leading-none" aria-hidden="true">
          expand_more
        </span>
      </button>

      {/* Dropdown panel — invisible until group hover */}
      <div className="absolute top-full left-0 pt-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 pointer-events-none group-hover:pointer-events-auto">
        <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-lg p-2 min-w-[260px]">
          {tools.map(({ href, label: toolLabel, desc }) => {
            const toolActive = normalized === href;
            return (
              <a
                key={href}
                href={href}
                aria-current={toolActive ? 'page' : undefined}
                className={
                  'flex flex-col px-3 py-2 rounded-lg transition-colors ' +
                  (toolActive
                    ? 'bg-primary-container/20 text-primary'
                    : 'hover:bg-surface-container-high text-on-surface')
                }
              >
                <span className="text-label-md font-medium">{toolLabel}</span>
                <span className="text-label-sm text-on-surface-variant mt-0.5">{desc}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface NavProps {
  currentPath: string;
}

export function Nav({ currentPath }: NavProps) {
  const normalized = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');

  return (
    <nav
      data-print="hide"
      className="sticky top-0 z-40 h-16 bg-surface/95 backdrop-blur-sm border-b border-border-subtle flex items-center"
    >
      <div className="max-w-[1280px] mx-auto w-full px-gutter flex items-center justify-between gap-lg">
        {/* Left: wordmark + grouped tool dropdowns */}
        <div className="flex items-center gap-lg">
          <a
            href="/"
            className="text-headline-md font-bold text-primary tracking-tight shrink-0"
          >
            NestMath
          </a>
          <div className="hidden md:flex items-center gap-lg">
            <ToolDropdown label="Home" tools={HOME_TOOLS} normalized={normalized} />
            <ToolDropdown label="Life" tools={LIFE_TOOLS} normalized={normalized} />
          </div>
        </div>

        {/* Right: icon buttons + CTA */}
        <div className="flex items-center gap-xs">
          <a
            href="https://ko-fi.com/paynekerz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support on Ko-fi"
            className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-xs rounded-lg hover:bg-surface-container-high"
          >
            coffee
          </a>
          <a
            href="https://github.com/paynekerz/NestMath"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-xs rounded-lg hover:bg-surface-container-high"
          >
            code
          </a>
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
