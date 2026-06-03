# NestMath.app

Buy vs. rent calculator that models real costs — mortgage, opportunity cost, appreciation, and taxes — and tells you the exact year buying beats renting.

Built with Astro 6, React 19, and Tailwind v4. Deployed as a static site on Vercel.

---

## Features

- Break-even year calculation with a clear verdict card
- Net worth over time line chart (buy vs. rent)
- Year-by-year breakdown table (collapsible)
- Advanced assumptions panel (appreciation rate, investment return, tax rate)
- Export analysis as CSV (Excel/Sheets-ready) or print-to-PDF — no dependencies
- Fully client-side — no API, no storage

---

## Running locally

```powershell
npm install
npm run dev
```

Requires Node.js `>=22.12.0`.

---

## Stack

| Package | Role |
|---|---|
| Astro 6 | Framework + static build |
| React 19 | Interactive island |
| Tailwind v4 | Utility CSS |
| Recharts | Net worth line chart |
| Vercel | Hosting |
