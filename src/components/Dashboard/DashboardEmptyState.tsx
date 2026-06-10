const FEATURED_TOOLS = [
  {
    href: '/net-worth',
    icon: 'account_balance',
    label: 'Net Worth Snapshot',
    desc: 'Add up what you own and owe to see where you stand.',
  },
  {
    href: '/emergency-fund',
    icon: 'savings',
    label: 'Emergency Fund',
    desc: 'How many months of expenses are you covered?',
  },
  {
    href: '/buy-vs-rent',
    icon: 'home',
    label: 'Buy vs. Rent',
    desc: 'Model the full financial picture of buying vs. renting.',
  },
  {
    href: '/credit-card-payoff',
    icon: 'credit_card',
    label: 'Credit Card Payoff',
    desc: "See when you'll be debt-free and how much interest you'll save.",
  },
  {
    href: '/retirement-projector',
    icon: 'trending_up',
    label: '401(k) Projector',
    desc: "Project your balance and check whether you're on track.",
  },
  {
    href: '/effective-hourly',
    icon: 'schedule',
    label: 'Effective Hourly Rate',
    desc: "What are you actually making per hour after taxes and commute?",
  },
] as const;

export function DashboardEmptyState() {
  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container-high mb-4">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>
            dashboard
          </span>
        </div>
        <h2 className="text-headline-md text-on-surface font-semibold mb-2">
          Your dashboard is empty
        </h2>
        <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
          Start with any calculator. Results appear here automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURED_TOOLS.map(({ href, icon, label, desc }) => (
          <a
            key={href}
            href={href}
            className="glass-card p-lg rounded-xl flex flex-col gap-3 hover:border-primary-accent/40 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-primary-accent"
                style={{ fontSize: '20px' }}
              >
                {icon}
              </span>
            </div>
            <div>
              <p className="text-label-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                {label}
              </p>
              <p className="text-label-sm text-on-surface-variant mt-0.5">{desc}</p>
            </div>
            <div className="flex items-center gap-1 text-label-sm text-primary-accent mt-auto">
              <span>Calculate</span>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
