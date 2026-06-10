import { useState, useEffect } from 'react';
import { SettingsMenu } from './SettingsMenu';

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

const DEBT_TOOLS: Tool[] = [
  { href: '/credit-card-payoff',   label: 'Credit Card Payoff',   desc: 'When will my credit card be paid off?' },
  { href: '/student-loan-payoff',  label: 'Student Loan Payoff',  desc: 'How long until my loans are gone?' },
  { href: '/debt-payoff-planner',  label: 'Debt Payoff Planner',  desc: 'Avalanche vs. snowball: which saves more?' },
];

const INVEST_TOOLS: Tool[] = [
  { href: '/hysa-calculator',        label: 'HYSA Calculator',        desc: 'How much will my savings earn?' },
  { href: '/investment-fees',        label: 'Investment Fees',        desc: 'How much do fees cost me?' },
  { href: '/retirement-projector',   label: '401(k) Projector',       desc: 'Am I on track to retire?' },
  { href: '/roth-vs-traditional',        label: 'Roth vs. Traditional',   desc: 'Which IRA saves me more in taxes?' },
  { href: '/social-security-break-even', label: 'Social Security',        desc: 'When should I claim Social Security?' },
];

const LIFE_TOOLS: Tool[] = [
  { href: '/raise-vs-job-hop',  label: 'Raise vs. Job Hop',  desc: 'Should I stay or switch jobs?' },
  { href: '/renovation-roi',    label: 'Renovation ROI',     desc: 'Is renovating worth it?' },
  { href: '/car-lease-vs-buy',  label: 'Car Lease vs. Buy',  desc: 'Should I lease or buy a car?' },
  { href: '/effective-hourly',  label: 'Effective Hourly',   desc: 'What am I actually making?' },
  { href: '/tax-withholding',   label: 'Tax Withholding',    desc: 'Am I withholding enough?' },
  { href: '/side-income',       label: 'Side Income',        desc: 'What does freelance income net after taxes?' },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.dataset.theme === 'light');
  }, []);

  const close = () => setMobileMenuOpen(false);

  function toggleTheme() {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.dataset.theme = 'light';
      localStorage.setItem('theme', 'light');
    } else {
      delete document.documentElement.dataset.theme;
      localStorage.removeItem('theme');
    }
  }

  const navItemClass = (href: string) =>
    'flex flex-col px-4 py-3 rounded-xl transition-colors ' +
    (normalized === href
      ? 'bg-primary-container/20 text-primary'
      : 'hover:bg-surface-container-high text-on-surface');

  return (
    <>
      <nav
        data-print="hide"
        className="sticky top-0 z-40 h-16 bg-surface/95 backdrop-blur-sm border-b border-border-subtle flex items-center"
      >
        <div className="max-w-[1280px] mx-auto w-full px-gutter flex items-center justify-between gap-lg">
          {/* Left: wordmark + desktop dropdowns */}
          <div className="flex items-center gap-lg">
            <a
              href="/"
              className="flex items-center gap-2 text-headline-md font-bold text-primary tracking-tight shrink-0"
            >
              <img src="/favicon.svg" alt="" aria-hidden="true" className="w-8 h-8" />
              NestMath
            </a>
            <div className="hidden lg:flex items-center gap-lg">
              <a
                href="/about"
                className={
                  'text-body-sm font-medium transition-colors pb-1 ' +
                  (normalized === '/about'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary')
                }
              >
                About
              </a>
              <a
                href="/dashboard"
                className={
                  'text-body-sm font-medium transition-colors pb-1 ' +
                  (normalized === '/dashboard'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary')
                }
              >
                Dashboard
              </a>
              <a
                href="/budget"
                className={
                  'text-body-sm font-medium transition-colors pb-1 ' +
                  (normalized === '/budget'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary')
                }
              >
                Budget
              </a>
              <ToolDropdown label="Home" tools={HOME_TOOLS} normalized={normalized} />
              <ToolDropdown label="Debt" tools={DEBT_TOOLS} normalized={normalized} />
              <ToolDropdown label="Invest" tools={INVEST_TOOLS} normalized={normalized} />
              <ToolDropdown label="Life" tools={LIFE_TOOLS} normalized={normalized} />
              <a
                href="/glossary"
                className={
                  'text-body-sm font-medium transition-colors pb-1 ' +
                  (normalized === '/glossary'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary')
                }
              >
                Glossary
              </a>
            </div>
          </div>

          {/* Right: desktop icon buttons + mobile Calculate trigger */}
          <div className="flex items-center gap-xs">
            <div className="hidden lg:flex items-center gap-xs">
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
              <SettingsMenu />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Calculate — open navigation menu"
              className="lg:hidden ml-xs bg-primary-container text-on-primary-container px-md py-xs rounded-lg text-label-md font-semibold flex items-center gap-0.5 hover:brightness-110 transition-all active:scale-95"
            >
              Calculate
              <span className="material-symbols-outlined text-[16px] leading-none" aria-hidden="true">
                expand_more
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen mobile overlay */}
      <div
        data-print="hide"
        className={
          'fixed inset-0 z-50 lg:hidden flex flex-col ' +
          (mobileMenuOpen ? 'opacity-100' : 'opacity-0')
        }
        style={{
          background: 'var(--color-surface)',
          visibility: mobileMenuOpen ? 'visible' : 'hidden',
          transition: mobileMenuOpen
            ? 'opacity 0.3s ease-out, visibility 0s 0s'
            : 'opacity 0.3s ease-out, visibility 0s 0.3s',
        }}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Atmospheric blur — matches index page */}
        <div
          className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full pointer-events-none -translate-y-1/4 translate-x-1/4"
          style={{ background: 'oklch(55% 0.18 250 / 0.08)', filter: 'blur(80px)' }}
          aria-hidden="true"
        />

        {/* Header row */}
        <div
          className={
            'flex items-center justify-between px-gutter h-16 border-b border-border-subtle shrink-0 transition-all duration-300 delay-75 ' +
            (mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2')
          }
        >
          <a
            href="/"
            onClick={close}
            className="flex items-center gap-2 text-headline-md font-bold text-primary tracking-tight"
          >
            <img src="/favicon.svg" alt="" aria-hidden="true" className="w-8 h-8" />
            NestMath
          </a>
          <button
            type="button"
            onClick={close}
            aria-label="Close navigation"
            className="bg-primary-container text-on-primary-container px-md py-xs rounded-lg text-label-md font-semibold flex items-center gap-0.5 hover:brightness-110 transition-all active:scale-95"
          >
            Close
            <span className="material-symbols-outlined text-[16px] leading-none" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Scrollable nav content */}
        <div
          className={
            'flex-1 overflow-y-auto px-gutter py-lg transition-all duration-300 delay-100 ' +
            (mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')
          }
        >
          {/* About */}
          <a
            href="/about"
            aria-current={normalized === '/about' ? 'page' : undefined}
            onClick={close}
            className={navItemClass('/about')}
          >
            <span className="text-body-sm font-semibold">About</span>
            <span className="text-label-sm text-on-surface-variant mt-0.5">About the project and why it's free</span>
          </a>

          {/* Budget section */}
          <p className="px-4 pt-5 pb-2 text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
            Budget
          </p>
          <a
            href="/dashboard"
            aria-current={normalized === '/dashboard' ? 'page' : undefined}
            onClick={close}
            className={navItemClass('/dashboard')}
          >
            <span className="text-body-sm font-semibold">Dashboard</span>
            <span className="text-label-sm text-on-surface-variant mt-0.5">Your full financial picture in one place</span>
          </a>
          <a
            href="/budget"
            aria-current={normalized === '/budget' ? 'page' : undefined}
            onClick={close}
            className={navItemClass('/budget')}
          >
            <span className="text-body-sm font-semibold">Budget</span>
            <span className="text-label-sm text-on-surface-variant mt-0.5">Track income, expenses, and savings</span>
          </a>

          {/* Home section */}
          <p className="px-4 pt-5 pb-2 text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
            Home
          </p>
          {HOME_TOOLS.map(({ href, label, desc }) => (
            <a
              key={href}
              href={href}
              aria-current={normalized === href ? 'page' : undefined}
              onClick={close}
              className={navItemClass(href)}
            >
              <span className="text-body-sm font-semibold">{label}</span>
              <span className="text-label-sm text-on-surface-variant mt-0.5">{desc}</span>
            </a>
          ))}

          {/* Debt section */}
          <p className="px-4 pt-5 pb-2 text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
            Debt
          </p>
          {DEBT_TOOLS.map(({ href, label, desc }) => (
            <a
              key={href}
              href={href}
              aria-current={normalized === href ? 'page' : undefined}
              onClick={close}
              className={navItemClass(href)}
            >
              <span className="text-body-sm font-semibold">{label}</span>
              <span className="text-label-sm text-on-surface-variant mt-0.5">{desc}</span>
            </a>
          ))}

          {/* Invest section */}
          <p className="px-4 pt-5 pb-2 text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
            Invest
          </p>
          {INVEST_TOOLS.map(({ href, label, desc }) => (
            <a
              key={href}
              href={href}
              aria-current={normalized === href ? 'page' : undefined}
              onClick={close}
              className={navItemClass(href)}
            >
              <span className="text-body-sm font-semibold">{label}</span>
              <span className="text-label-sm text-on-surface-variant mt-0.5">{desc}</span>
            </a>
          ))}

          {/* Life section */}
          <p className="px-4 pt-5 pb-2 text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
            Life
          </p>
          {LIFE_TOOLS.map(({ href, label, desc }) => (
            <a
              key={href}
              href={href}
              aria-current={normalized === href ? 'page' : undefined}
              onClick={close}
              className={navItemClass(href)}
            >
              <span className="text-body-sm font-semibold">{label}</span>
              <span className="text-label-sm text-on-surface-variant mt-0.5">{desc}</span>
            </a>
          ))}

          {/* Glossary */}
          <a
            href="/glossary"
            aria-current={normalized === '/glossary' ? 'page' : undefined}
            onClick={close}
            className={navItemClass('/glossary')}
          >
            <span className="text-body-sm font-semibold">Glossary</span>
            <span className="text-label-sm text-on-surface-variant mt-0.5">Plain-English definitions for every financial term</span>
          </a>

          {/* Divider + utility links */}
          <div className="h-px bg-border-subtle my-5 mx-1" />

          <a
            href="https://ko-fi.com/paynekerz"
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">coffee</span>
            <span className="text-body-sm font-medium">Support on Ko-fi</span>
          </a>
          <a
            href="https://github.com/paynekerz/NestMath"
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">code</span>
            <span className="text-body-sm font-medium">GitHub</span>
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {isLight ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="text-body-sm font-medium">{isLight ? 'Dark mode' : 'Light mode'}</span>
          </button>

          {/* Bottom breathing room */}
          <div className="h-8" />
        </div>
      </div>
    </>
  );
}
