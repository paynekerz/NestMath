import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Design tokens ────────────────────────────────────────────────────────────
const C_PRIMARY = 'oklch(55% 0.18 250)';
const C_SUCCESS = 'oklch(55% 0.16 145)';
const C_WARNING = 'oklch(65% 0.15 55)';
const C_MUTED   = 'oklch(55% 0.01 260)';
const C_DANGER  = 'oklch(55% 0.18 20)';

const TOOLTIP_STYLE = {
  background: 'oklch(17% 0.025 260)',
  border: '1px solid oklch(25% 0.02 260)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'oklch(90% 0.01 260)',
};
const LABEL_STYLE = { color: 'oklch(90% 0.01 260)', marginBottom: '4px' };
const ITEM_STYLE  = { color: 'oklch(90% 0.01 260)' };
const GRID_STROKE = 'oklch(25% 0.02 260)';
const TICK_FILL   = 'oklch(55% 0.01 260)';

const cur = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function fmtK(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

// ── Chart data ───────────────────────────────────────────────────────────────

const compoundData = Array.from({ length: 30 }, (_, i) => {
  const y = i + 1;
  return {
    year: y,
    '8% return': Math.round(5_000 * 1.08 ** y),
    '5% return': Math.round(5_000 * 1.05 ** y),
    '2% return': Math.round(5_000 * 1.02 ** y),
  };
});

const amortData = (() => {
  const loan = 300_000, r = 0.0675 / 12, n = 360;
  const pmt = (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  let bal = loan;
  return Array.from({ length: 30 }, (_, i) => {
    let int = 0, prin = 0;
    for (let m = 0; m < 12; m++) {
      const mi = bal * r;
      const pi = Math.min(pmt - mi, bal);
      int  += mi;
      prin += pi;
      bal = Math.max(0, bal - pi);
    }
    return { year: i + 1, Interest: Math.round(int), Principal: Math.round(prin) };
  });
})();

const inflationData = Array.from({ length: 30 }, (_, i) => ({
  year: i + 1,
  'Buying power': +(100 * 0.975 ** (i + 1)).toFixed(2),
}));

const feeData = (() => {
  let lo = 50_000, hi = 50_000;
  const pmt = 500;
  const rLo = (0.08 - 0.0004) / 12;
  const rHi = (0.08 - 0.01)   / 12;
  return Array.from({ length: 30 }, (_, i) => {
    for (let m = 0; m < 12; m++) {
      lo = lo * (1 + rLo) + pmt;
      hi = hi * (1 + rHi) + pmt;
    }
    return {
      year: i + 1,
      'Low-cost (0.04%)': Math.round(lo),
      'High-fee (1.0%)':  Math.round(hi),
    };
  });
})();

// ── Shared chart wrapper ──────────────────────────────────────────────────────

function ChartCard({
  caption,
  legend,
  children,
}: {
  caption: string;
  legend: { label: string; color: string; shape?: 'line' | 'area' }[];
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-lg mt-4">
      <p className="text-label-sm text-on-surface-variant mb-3">{caption}</p>
      {children}
      <div className="flex flex-wrap gap-4 mt-2">
        {legend.map(({ label, color, shape = 'line' }) => (
          <span key={label} className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
            {shape === 'line' ? (
              <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: color }} />
            ) : (
              <span className="inline-block w-3 h-2 rounded" style={{ background: color, opacity: 0.65 }} />
            )}
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Individual charts ────────────────────────────────────────────────────────

function CompoundInterestChart() {
  return (
    <ChartCard
      caption="$5,000 invested at different annual return rates, no additional contributions"
      legend={[
        { label: '8% return', color: C_SUCCESS },
        { label: '5% return', color: C_PRIMARY },
        { label: '2% return', color: C_MUTED },
      ]}
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={compoundData} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis
            dataKey="year"
            tick={{ fill: TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: GRID_STROKE }}
            tickLine={false}
            label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: TICK_FILL, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={fmtK}
            tick={{ fill: TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: GRID_STROKE }}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(v: unknown, name: string) => [cur.format(v as number), name]}
            labelFormatter={(v: unknown) => `Year ${v}`}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={LABEL_STYLE}
            itemStyle={ITEM_STYLE}
          />
          <Line type="monotone" dataKey="8% return" stroke={C_SUCCESS} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="5% return" stroke={C_PRIMARY} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="2% return" stroke={C_MUTED}   strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function AmortizationChart() {
  return (
    <ChartCard
      caption="$300,000 mortgage at 6.75%, showing how each year's payments break down"
      legend={[
        { label: 'Interest', color: C_WARNING, shape: 'area' },
        { label: 'Principal', color: C_PRIMARY, shape: 'area' },
      ]}
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={amortData} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis
            dataKey="year"
            tick={{ fill: TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: GRID_STROKE }}
            tickLine={false}
            label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: TICK_FILL, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={fmtK}
            tick={{ fill: TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: GRID_STROKE }}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(v: unknown, name: string) => [cur.format(v as number), name]}
            labelFormatter={(v: unknown) => `Year ${v}`}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={LABEL_STYLE}
            itemStyle={ITEM_STYLE}
          />
          <Area type="monotone" dataKey="Interest"  stackId="a" stroke={C_WARNING} fill={C_WARNING} fillOpacity={0.35} strokeWidth={1.5} />
          <Area type="monotone" dataKey="Principal" stackId="a" stroke={C_PRIMARY} fill={C_PRIMARY} fillOpacity={0.35} strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function InflationChart() {
  return (
    <ChartCard
      caption="Purchasing power of $100 over 30 years at 2.5% annual inflation"
      legend={[{ label: 'Value of $100 in today\'s dollars', color: C_DANGER }]}
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={inflationData} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis
            dataKey="year"
            tick={{ fill: TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: GRID_STROKE }}
            tickLine={false}
            label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: TICK_FILL, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            tick={{ fill: TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: GRID_STROKE }}
            tickLine={false}
            width={48}
            domain={[40, 100]}
          />
          <Tooltip
            formatter={(v: unknown) => [`$${(v as number).toFixed(2)}`, 'Buying power']}
            labelFormatter={(v: unknown) => `Year ${v}`}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={LABEL_STYLE}
            itemStyle={ITEM_STYLE}
          />
          <Line type="monotone" dataKey="Buying power" stroke={C_DANGER} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ExpenseRatioChart() {
  const lastLo = feeData[feeData.length - 1]['Low-cost (0.04%)'];
  const lastHi = feeData[feeData.length - 1]['High-fee (1.0%)'];
  const diff   = lastLo - lastHi;
  return (
    <ChartCard
      caption={`$50,000 invested with $500/month at 8% gross return. The fee difference costs ${cur.format(diff)} over 30 years.`}
      legend={[
        { label: 'Low-cost (0.04%)', color: C_SUCCESS },
        { label: 'High-fee (1.0%)',  color: C_MUTED },
      ]}
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={feeData} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis
            dataKey="year"
            tick={{ fill: TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: GRID_STROKE }}
            tickLine={false}
            label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: TICK_FILL, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={fmtK}
            tick={{ fill: TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: GRID_STROKE }}
            tickLine={false}
            width={64}
          />
          <Tooltip
            formatter={(v: unknown, name: string) => [cur.format(v as number), name]}
            labelFormatter={(v: unknown) => `Year ${v}`}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={LABEL_STYLE}
            itemStyle={ITEM_STYLE}
          />
          <Line type="monotone" dataKey="Low-cost (0.04%)" stroke={C_SUCCESS} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="High-fee (1.0%)"  stroke={C_MUTED}   strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── Term data ────────────────────────────────────────────────────────────────

interface TermData {
  id: string;
  term: string;
  definition: string;
  extra?: string;
  tools?: { label: string; href: string }[];
}

const TERMS: TermData[] = [
  {
    id: '401k',
    term: '401(k)',
    definition: 'A 401(k) is a retirement savings account offered through your employer. It lets you save money before taxes are taken out, which lowers your taxable income today and helps your savings grow tax-deferred until retirement. Many employers match a portion of what you contribute, which is free money added to your account. The 2025 employee contribution limit is $23,500, plus an extra $7,500 catch-up contribution if you\'re 50 or older.',
    tools: [
      { label: 'Retirement Projector', href: '/retirement-projector' },
      { label: 'Roth vs. Traditional IRA', href: '/roth-vs-traditional' },
    ],
  },
  {
    id: 'amortization',
    term: 'Amortization',
    definition: 'When you take out a loan, amortization is how your monthly payments slowly pay it off over time. Each payment covers two things: interest (the fee for borrowing) and principal (the actual loan amount). Early on, most of your payment goes toward interest; over time, that flips, and more goes toward the principal until the loan is paid off.',
    extra: 'The chart below shows a $300,000 mortgage at 6.75%. In year 1, most of your annual payments are interest. By the late years, you\'re paying mostly principal.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Mortgage Payoff', href: '/payoff' },
      { label: 'Refinance', href: '/refinance' },
    ],
  },
  {
    id: 'apr',
    term: 'APR (Annual Percentage Rate)',
    definition: 'APR is the true yearly cost of borrowing money, shown as a percentage. It includes the interest rate plus any fees the lender charges, like origination fees or points. APR is always higher than the basic interest rate. When comparing loans, use the APR because it shows the full picture of what you\'ll pay each year.',
    tools: [
      { label: 'Credit Card Payoff', href: '/credit-card-payoff' },
      { label: 'Mortgage Payoff', href: '/payoff' },
    ],
  },
  {
    id: 'apy',
    term: 'APY (Annual Percentage Yield)',
    definition: 'APY is how much your money actually earns in a savings account over a full year, factoring in compound interest. It\'s almost always higher than the stated interest rate because interest is added to your balance and then earns more interest. When comparing savings accounts, the APY is the most accurate number to look at.',
    tools: [
      { label: 'HYSA Calculator', href: '/hysa-calculator' },
      { label: 'Emergency Fund', href: '/emergency-fund' },
    ],
  },
  {
    id: 'avalanche-method',
    term: 'Avalanche Method',
    definition: 'The avalanche method is a debt payoff strategy where you put all your extra money toward the debt with the highest interest rate first, regardless of the balance. Once that debt is gone, you move to the next highest rate. This approach saves the most money on interest over time compared to any other payoff order.',
    tools: [
      { label: 'Debt Payoff Planner', href: '/debt-payoff-planner' },
    ],
  },
  {
    id: 'break-even',
    term: 'Break-Even Point',
    definition: 'The break-even point is the moment when two financial choices cost exactly the same total amount; neither one is better than the other yet. Before that point, one option is cheaper; after it, the other starts pulling ahead. For example, if you refinance your mortgage, your break-even point is when the monthly savings from your lower rate equal what you paid in closing costs.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Refinance', href: '/refinance' },
      { label: 'Social Security Break-Even', href: '/social-security-break-even' },
    ],
  },
  {
    id: 'closing-costs',
    term: 'Closing Costs',
    definition: 'Closing costs are the fees you pay to finalize a home purchase or mortgage refinance. They cover things like loan origination fees, the home appraisal, title search, and government recording fees. They typically run 2–5% of the loan amount and are paid upfront on the day you close the deal.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Affordability', href: '/affordability' },
      { label: 'Refinance', href: '/refinance' },
    ],
  },
  {
    id: 'compound-interest',
    term: 'Compound Interest',
    definition: 'Compound interest means you earn interest not just on the money you put in, but also on the interest you\'ve already earned. Each time interest is added to your balance, that new, larger balance earns more interest. Over long periods, this creates a snowball effect where your money grows faster and faster, which is why starting early matters so much.',
    extra: 'The chart shows $5,000 invested at three different return rates. Notice how the gap between the lines grows dramatically over time, showing the power of compounding.',
    tools: [
      { label: 'HYSA Calculator', href: '/hysa-calculator' },
      { label: 'Investment Fees', href: '/investment-fees' },
      { label: 'Retirement Projector', href: '/retirement-projector' },
    ],
  },
  {
    id: 'debt-to-income-ratio',
    term: 'Debt-to-Income Ratio (DTI)',
    definition: 'Your debt-to-income ratio (DTI) is the percentage of your gross monthly income that goes toward debt payments: mortgage or rent, car loan, student loans, and credit cards. Lenders use DTI to judge whether you can afford a new loan. A DTI under 36% is generally considered healthy; above 43%, most mortgage lenders won\'t approve the application.',
    extra: 'Lenders check two types: front-end DTI (just housing costs) and back-end DTI (all debt combined). Both matter when qualifying for a mortgage.',
    tools: [
      { label: 'Affordability', href: '/affordability' },
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
    ],
  },
  {
    id: 'depreciation',
    term: 'Depreciation',
    definition: 'Depreciation is the loss in value of an asset over time. Cars are famous for depreciating quickly; a brand-new car can lose 15–20% of its value in the first year alone and 50% or more within five years. Unlike a home, a car almost never goes back up in value, which is one reason the lease vs. buy math is so different from home buying.',
    tools: [
      { label: 'Car Lease vs. Buy', href: '/car-lease-vs-buy' },
    ],
  },
  {
    id: 'down-payment',
    term: 'Down Payment',
    definition: 'A down payment is the upfront cash you pay when buying a home or car. The rest of the purchase price is covered by a loan. For homes, 20% is the traditional target: it helps you avoid private mortgage insurance (PMI) and qualify for better loan terms. A bigger down payment means a smaller loan, lower monthly payments, and less total interest paid.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Affordability', href: '/affordability' },
      { label: 'Savings Planner', href: '/savings-planner' },
    ],
  },
  {
    id: 'effective-tax-rate',
    term: 'Effective Tax Rate',
    definition: 'Your effective tax rate is the average percentage of your total income that goes to federal income taxes. It\'s always lower than your marginal tax rate because lower portions of your income are taxed at lower rates. If you earned $80,000 and paid $12,000 in taxes, your effective rate is 15%, even if your top tax bracket is 22%. Your effective rate is the most honest answer to "how much of my income actually goes to taxes?"',
    tools: [
      { label: 'Tax Withholding', href: '/tax-withholding' },
      { label: 'Effective Hourly', href: '/effective-hourly' },
    ],
  },
  {
    id: 'emergency-fund',
    term: 'Emergency Fund',
    definition: 'An emergency fund is money you keep saved in a separate, easy-to-access account, set aside only for true emergencies like job loss, medical bills, or a major car repair. Most financial experts recommend saving 3–6 months of essential living expenses. It\'s your financial safety net so you don\'t have to go into high-interest debt when something unexpected hits.',
    tools: [
      { label: 'Emergency Fund Calculator', href: '/emergency-fund' },
      { label: 'HYSA Calculator', href: '/hysa-calculator' },
    ],
  },
  {
    id: 'equity',
    term: 'Equity',
    definition: 'Home equity is the portion of your home that you actually own. It\'s the home\'s current market value minus what you still owe on your mortgage. If your home is worth $400,000 and your remaining mortgage balance is $280,000, you have $120,000 in equity. Equity grows as you pay down your loan and as your home\'s value increases.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Net Worth', href: '/net-worth' },
      { label: 'Mortgage Payoff', href: '/payoff' },
    ],
  },
  {
    id: 'etf',
    term: 'ETF (Exchange-Traded Fund)',
    definition: 'An ETF (Exchange-Traded Fund) is an investment that holds a basket of stocks, bonds, or other assets, similar to a mutual fund, but it trades on the stock market like a regular stock. ETFs let you own a small piece of hundreds of companies at once with a single purchase. Most ETFs are "passive": they track a market index like the S&P 500 instead of paying managers to pick stocks, which keeps their fees (expense ratios) very low.',
    tools: [
      { label: 'Investment Fees', href: '/investment-fees' },
      { label: 'Retirement Projector', href: '/retirement-projector' },
    ],
  },
  {
    id: 'expense-ratio',
    term: 'Expense Ratio',
    definition: 'An expense ratio is the annual fee a mutual fund or ETF charges to manage your money. It\'s expressed as a percentage of your investment and deducted automatically; you never write a check. Even a small-looking difference (like 1% vs. 0.04%) costs a massive amount over decades because high fees reduce the compounding balance every single year.',
    extra: 'The chart shows two investors with the same starting amount, monthly contributions, and gross return. The only difference is the expense ratio.',
    tools: [
      { label: 'Investment Fees', href: '/investment-fees' },
    ],
  },
  {
    id: 'fica-tax',
    term: 'FICA Tax',
    definition: 'FICA stands for Federal Insurance Contributions Act. It\'s the automatic payroll tax that funds Social Security and Medicare. Employees pay 7.65% (6.2% for Social Security + 1.45% for Medicare), and employers match the same amount on your behalf. If you\'re self-employed, you pay both sides: 15.3% total, because you count as both the employee and the employer.',
    tools: [
      { label: 'Effective Hourly', href: '/effective-hourly' },
      { label: 'Side Income Calculator', href: '/side-income' },
    ],
  },
  {
    id: 'fixed-rate-mortgage',
    term: 'Fixed-Rate Mortgage',
    definition: 'A fixed-rate mortgage is a home loan where the interest rate stays exactly the same for the entire life of the loan. Your monthly principal and interest payment never changes, whether the term is 15 or 30 years. This makes budgeting predictable and protects you if market interest rates rise after you close. Fixed-rate mortgages are the most common mortgage type in the United States.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Mortgage Payoff', href: '/payoff' },
      { label: 'Refinance', href: '/refinance' },
    ],
  },
  {
    id: 'gross-income',
    term: 'Gross Income',
    definition: 'Gross income is the total amount of money you earn before any taxes or deductions are taken out. It\'s the number at the top of your pay stub, before Social Security, Medicare, federal income tax, health insurance, and 401(k) contributions reduce it. Lenders use your gross income (not your take-home pay) to calculate how much house you can afford and to determine your debt-to-income ratio.',
    tools: [
      { label: 'Affordability', href: '/affordability' },
      { label: 'Tax Withholding', href: '/tax-withholding' },
      { label: 'Effective Hourly', href: '/effective-hourly' },
    ],
  },
  {
    id: 'hoa-fee',
    term: 'HOA Fee',
    definition: 'An HOA (Homeowners Association) fee is a regular charge paid by homeowners in certain communities or buildings. The HOA collects these fees to maintain shared spaces like pools, gyms, hallways, and landscaping. HOA fees can range from under $100 to over $1,000 per month and are an ongoing cost of ownership that renters don\'t pay.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Affordability', href: '/affordability' },
    ],
  },
  {
    id: 'hysa',
    term: 'HYSA (High-Yield Savings Account)',
    definition: 'A high-yield savings account (HYSA) works exactly like a regular savings account, but pays a much higher interest rate, often 10 to 20 times more than what traditional banks offer. HYSAs are typically offered by online banks, are FDIC-insured (your money is protected up to $250,000), and let you withdraw funds anytime. They\'re ideal for emergency funds or money you\'ll need within the next few years.',
    tools: [
      { label: 'HYSA Calculator', href: '/hysa-calculator' },
      { label: 'Emergency Fund', href: '/emergency-fund' },
      { label: 'Savings Planner', href: '/savings-planner' },
    ],
  },
  {
    id: 'index-fund',
    term: 'Index Fund',
    definition: 'An index fund is a type of mutual fund or ETF designed to match the performance of a specific market index, like the S&P 500, which tracks the 500 largest U.S. companies. Because index funds follow an index instead of paying managers to pick stocks, they charge very low fees. Over long periods, most actively managed funds underperform low-cost index funds once their higher fees are subtracted from returns.',
    tools: [
      { label: 'Investment Fees', href: '/investment-fees' },
      { label: 'Retirement Projector', href: '/retirement-projector' },
      { label: 'Savings Planner', href: '/savings-planner' },
    ],
  },
  {
    id: 'inflation',
    term: 'Inflation',
    definition: 'Inflation is the gradual rise in prices over time, meaning the same dollar buys less as years pass. The US average is about 2–3% per year. If your savings account earns 0.5% while inflation runs at 2.5%, your money is actually losing purchasing power every year, even though the account balance is going up.',
    extra: 'The chart shows what $100 can buy over 30 years at 2.5% annual inflation. By year 30, that $100 has the real-world buying power of about $47 today.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Retirement Projector', href: '/retirement-projector' },
      { label: 'HYSA Calculator', href: '/hysa-calculator' },
    ],
  },
  {
    id: 'marginal-tax-rate',
    term: 'Marginal Tax Rate',
    definition: 'Your marginal tax rate is the percentage you pay on the last dollar you earn, not on all your income. The US uses a progressive tax system where lower portions of your income are taxed at lower rates, and higher portions are taxed at higher rates. If you\'re in the 22% tax bracket, only the income above that bracket\'s threshold is taxed at 22%; everything below it is taxed at lower rates.',
    extra: 'Example: As a single filer earning $80,000 in 2025, you pay 10% on the first $11,925, 12% on income from $11,926 to $48,475, and 22% on the rest, not 22% on all $80,000.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Effective Hourly', href: '/effective-hourly' },
      { label: 'Tax Withholding', href: '/tax-withholding' },
    ],
  },
  {
    id: 'minimum-payment',
    term: 'Minimum Payment',
    definition: 'The minimum payment is the smallest amount your credit card or loan requires you to pay each month. Paying just the minimum keeps you out of default, but barely dents your balance; most of the payment goes toward interest. On a $5,000 credit card balance at 22% APR, paying only the minimum could take more than 15 years to pay off and cost more in interest than the original balance.',
    tools: [
      { label: 'Credit Card Payoff', href: '/credit-card-payoff' },
    ],
  },
  {
    id: 'mortgage',
    term: 'Mortgage',
    definition: 'A mortgage is a loan you take out to buy a home. The lender gives you the purchase money upfront, and you agree to repay it, with interest, over a set period, typically 15 or 30 years. The home itself serves as collateral: if you stop making payments, the lender can take the home back through a process called foreclosure. Your monthly payment usually covers principal, interest, property taxes, and homeowner\'s insurance (PITI).',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Mortgage Payoff', href: '/payoff' },
      { label: 'Affordability', href: '/affordability' },
    ],
  },
  {
    id: 'net-worth',
    term: 'Net Worth',
    definition: 'Net worth is everything you own (assets) minus everything you owe (liabilities). Assets include savings, investments, retirement accounts, home equity, and vehicle value. Liabilities include mortgage debt, car loans, credit card balances, and student loans. A positive net worth means your assets outweigh your debts; steadily growing this number over time is one of the clearest measures of financial health.',
    tools: [
      { label: 'Net Worth Snapshot', href: '/net-worth' },
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
    ],
  },
  {
    id: 'opportunity-cost',
    term: 'Opportunity Cost',
    definition: 'Opportunity cost is what you give up by choosing one option over another. It\'s not a fee you pay; it\'s the potential benefit you miss out on. Every financial decision has one. If you spend $20,000 on a home renovation, the opportunity cost is the return you could have earned by investing that money instead. Understanding opportunity cost helps you make honest comparisons between choices.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Renovation ROI', href: '/renovation-roi' },
      { label: 'Car Lease vs. Buy', href: '/car-lease-vs-buy' },
    ],
  },
  {
    id: 'piti',
    term: 'PITI',
    definition: 'PITI stands for Principal, Interest, Taxes, and Insurance: the four components that make up a complete monthly mortgage payment. Principal and interest go to the lender. Property taxes and homeowner\'s insurance are often collected by the lender and held in an escrow account, then paid on your behalf. Lenders use your total PITI to determine how much house you can afford relative to your income.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Affordability', href: '/affordability' },
    ],
  },
  {
    id: 'pmi',
    term: 'PMI (Private Mortgage Insurance)',
    definition: 'PMI (Private Mortgage Insurance) is a monthly fee required by lenders when your down payment on a home is less than 20% of the purchase price. PMI protects the lender, not you, if you stop making payments. It typically costs 0.5–1.5% of the loan amount per year, adding hundreds of dollars to your monthly payment. Once you build 20% equity in your home, you can usually request to cancel PMI and remove that cost.',
    tools: [
      { label: 'Buy vs. Rent', href: '/buy-vs-rent' },
      { label: 'Affordability', href: '/affordability' },
      { label: 'Savings Planner', href: '/savings-planner' },
    ],
  },
  {
    id: 'principal',
    term: 'Principal',
    definition: 'The principal is the actual amount of money you borrowed, not counting any interest. When you make a loan payment, part of it goes to interest (the lender\'s fee for lending you money) and part goes toward reducing the principal. Paying extra toward the principal shrinks your balance faster, which means you pay less total interest over the life of the loan.',
    tools: [
      { label: 'Mortgage Payoff', href: '/payoff' },
      { label: 'Credit Card Payoff', href: '/credit-card-payoff' },
      { label: 'Student Loan Payoff', href: '/student-loan-payoff' },
    ],
  },
  {
    id: 'rate-of-return',
    term: 'Rate of Return',
    definition: 'Rate of return is the percentage gain or loss on an investment over a period of time. If you invest $10,000 and it grows to $10,700, your rate of return is 7%. When people talk about long-term stock market performance, they mean the average annual rate of return, historically around 7–10% per year for broad U.S. stock indexes. A higher rate of return means your money grows faster, which is why fees that reduce your net return compound against you so heavily over decades.',
    tools: [
      { label: 'Investment Fees', href: '/investment-fees' },
      { label: 'Renovation ROI', href: '/renovation-roi' },
      { label: 'Retirement Projector', href: '/retirement-projector' },
      { label: 'HYSA Calculator', href: '/hysa-calculator' },
    ],
  },
  {
    id: 'refinancing',
    term: 'Refinancing',
    definition: 'Refinancing means replacing your existing loan with a new one, typically to get a lower interest rate, different loan term, or lower monthly payment. For mortgages, this involves paying closing costs upfront in exchange for savings going forward. The key question is always the break-even point: how long until the monthly savings outweigh the cost of refinancing?',
    tools: [
      { label: 'Refinance Break-Even', href: '/refinance' },
      { label: 'Mortgage Payoff', href: '/payoff' },
    ],
  },
  {
    id: 'roth-ira',
    term: 'Roth IRA',
    definition: 'A Roth IRA is an individual retirement account where you contribute money you\'ve already paid taxes on. Your money then grows tax-free, and qualified withdrawals in retirement are completely tax-free, including all the investment growth. The trade-off is that you don\'t get a tax deduction today. Roth IRAs are generally better for people who expect to be in a higher tax bracket in retirement than they are now. Contribution income limits apply, and eligibility phases out at higher income levels.',
    tools: [
      { label: 'Roth vs. Traditional IRA', href: '/roth-vs-traditional' },
      { label: 'Retirement Projector', href: '/retirement-projector' },
    ],
  },
  {
    id: 'self-employment-tax',
    term: 'Self-Employment Tax',
    definition: 'Self-employment tax is the extra tax paid by people who work for themselves: freelancers, contractors, and business owners. Regular employees split Social Security and Medicare taxes with their employer (each side pays 7.65%). When you\'re self-employed, you pay both sides: 15.3% total on your net earnings. The IRS does let you deduct half of this tax from your income before calculating your income tax, which reduces your overall tax bill somewhat.',
    tools: [
      { label: 'Side Income Calculator', href: '/side-income' },
      { label: 'Effective Hourly', href: '/effective-hourly' },
    ],
  },
  {
    id: 'snowball-method',
    term: 'Snowball Method',
    definition: 'The snowball method is a debt payoff strategy where you focus your extra money on the smallest balance first, regardless of interest rate. Once that debt is cleared, you roll that payment amount onto the next smallest balance. This method may cost more in total interest than the avalanche method, but the fast early wins can help keep you motivated and on track.',
    tools: [
      { label: 'Debt Payoff Planner', href: '/debt-payoff-planner' },
    ],
  },
  {
    id: 'tax-bracket',
    term: 'Tax Bracket',
    definition: 'A tax bracket is an income range that\'s taxed at a specific rate. The US uses a progressive system with several brackets: you pay lower rates on the first portions of your income and higher rates as your income climbs. Getting a raise that pushes you into a higher bracket doesn\'t mean all your income is taxed at that rate; only the income above the threshold is.',
    extra: 'Example: If you\'re in the 22% bracket, you still pay 10% on your first $11,925 of income (2025 rates). The 22% rate only applies to the slice of income above the 22% bracket\'s starting point.',
    tools: [
      { label: 'Effective Hourly', href: '/effective-hourly' },
      { label: 'Tax Withholding', href: '/tax-withholding' },
      { label: 'Roth vs. Traditional IRA', href: '/roth-vs-traditional' },
    ],
  },
  {
    id: 'traditional-ira',
    term: 'Traditional IRA',
    definition: 'A Traditional IRA is an individual retirement account where your contributions may be tax-deductible today, reducing your taxable income in the year you contribute. Your money grows tax-deferred, meaning you don\'t pay taxes on gains until you withdraw in retirement, when they\'re taxed as regular income. You\'re required to start taking withdrawals at age 73 (called Required Minimum Distributions). A Traditional IRA generally works best if you expect to be in a lower tax bracket in retirement than you are today.',
    tools: [
      { label: 'Roth vs. Traditional IRA', href: '/roth-vs-traditional' },
    ],
  },
  {
    id: 'withholding',
    term: 'Withholding',
    definition: 'Withholding is the money your employer automatically takes out of each paycheck and sends to the IRS on your behalf to cover your estimated federal income taxes for the year. You control how much is withheld by filling out a W-4 form when you start a job. If too little is withheld, you\'ll owe the difference (plus possible penalties) when you file your return. If too much is withheld, you get a refund, which is just your own money returned to you without any interest earned on it.',
    tools: [
      { label: 'Tax Withholding', href: '/tax-withholding' },
      { label: 'Side Income Calculator', href: '/side-income' },
    ],
  },
];

// ── Page component ───────────────────────────────────────────────────────────

export function GlossaryPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Atmospheric blur */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none -translate-y-1/4 translate-x-1/4"
        style={{ background: 'oklch(55% 0.18 250 / 0.08)', filter: 'blur(120px)' }}
        aria-hidden="true"
      />

      <div className="max-w-[800px] mx-auto px-[24px] py-[64px]">

        {/* ── Header ── */}
        <div className="animate-reveal mb-[48px]">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-container/10 border border-primary/20 px-4 py-2 mb-6">
            <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">menu_book</span>
            <span className="text-label-sm text-primary">Financial Glossary</span>
          </div>
          <h1 className="text-headline-xl font-bold text-on-surface leading-tight -tracking-[0.02em] mb-4">
            Plain-English definitions for every financial term on NestMath.
          </h1>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            {TERMS.length} terms with plain-English definitions. Some include interactive charts.
          </p>
        </div>

        {/* ── Table of Contents ── */}
        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-lg mb-[64px] animate-reveal stagger-1">
          <h2 className="text-label-md font-semibold text-on-surface mb-4">Jump to a term</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-0.5">
            {TERMS.map(({ id, term }) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-label-sm text-primary hover:underline py-1.5 px-2 rounded-lg hover:bg-surface-container-high transition-colors truncate"
              >
                {term}
              </a>
            ))}
          </div>
        </div>

        {/* ── Terms ── */}
        <div className="space-y-[56px]">
          {TERMS.map(({ id, term, definition, extra, tools }) => (
            <section key={id} id={id} className="scroll-mt-20">

              {/* Term heading + tool chips */}
              <div className="flex flex-col gap-3 mb-4">
                <h2 className="text-headline-md font-bold text-on-surface">{term}</h2>
                {tools && tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tools.map(({ label, href }) => (
                      <a
                        key={href}
                        href={href}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary-container/10 text-primary border border-primary/20 hover:bg-primary-container/20 transition-colors whitespace-nowrap"
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Definition */}
              <p className="text-body-md text-on-surface-variant leading-relaxed">{definition}</p>
              {extra && (
                <p className="text-body-md text-on-surface-variant leading-relaxed mt-3">{extra}</p>
              )}

              {/* Charts */}
              {id === 'compound-interest' && <CompoundInterestChart />}
              {id === 'amortization'       && <AmortizationChart />}
              {id === 'inflation'          && <InflationChart />}
              {id === 'expense-ratio'      && <ExpenseRatioChart />}

              {/* Back to top */}
              <a
                href="#"
                className="inline-flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-primary transition-colors mt-5"
              >
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">arrow_upward</span>
                Back to top
              </a>

              <div className="h-px bg-border-subtle mt-8" />
            </section>
          ))}
        </div>

      </div>
    </div>
  );
}
