import { useState, useEffect } from 'react';
import type { BuyInputs, RentInputs } from '../../lib/calculator';
import type { ValidationErrors } from '../../lib/validation';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  buy: BuyInputs;
  rent: RentInputs;
  investmentReturn: number;
  onBuyChange: (key: keyof BuyInputs, value: number) => void;
  onRentChange: (key: keyof RentInputs, value: number) => void;
  onInvestmentReturnChange: (v: number) => void;
  buyErrors?: ValidationErrors;
  rentErrors?: ValidationErrors;
}

interface SliderFieldProps {
  label: string;
  displayValue: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent?: 'primary' | 'emerald';
}

interface FieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  tooltip?: string;
  error?: string;
}

const fmtDollar = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function pct(v: number): number {
  return parseFloat((v * 100).toFixed(4));
}

function SliderField({ label, displayValue, value, min, max, step, onChange, accent = 'primary' }: SliderFieldProps) {
  return (
    <div className="space-y-[8px]">
      <div className="flex justify-between items-baseline">
        <span className="text-label-md text-on-surface-variant">{label}</span>
        <span className={`text-label-md font-mono-data ${accent === 'emerald' ? 'text-success-emerald' : 'text-primary'}`}>
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full"
        aria-label={label}
      />
    </div>
  );
}

function Field({ id, label, value, onChange, prefix, suffix, step = 1, min = 0, tooltip, error }: FieldProps) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-label-sm text-on-surface-variant">{label}</label>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className={`flex items-center gap-1 rounded-lg border bg-surface-container-low px-[10px] py-[6px] focus-within:border-primary-accent focus-within:ring-1 focus-within:ring-primary-accent transition-all ${error ? 'border-error' : 'border-border-subtle'}`}>
        {prefix && <span className="text-on-surface-variant text-body-sm select-none">{prefix}</span>}
        <input
          id={id}
          type="number"
          value={draft}
          step={step}
          min={min}
          onChange={e => setDraft(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            const parsed = parseFloat(draft);
            onChange(isNaN(parsed) ? 0 : parsed);
          }}
          className="flex-1 min-w-0 bg-transparent outline-none text-body-sm text-right font-mono-data text-on-surface"
        />
        {suffix && <span className="text-on-surface-variant text-body-sm select-none">{suffix}</span>}
      </div>
      {error && <p className="text-label-sm text-error">{error}</p>}
    </div>
  );
}

export function InputPanel({ buy, rent, investmentReturn, onBuyChange, onRentChange, onInvestmentReturnChange, buyErrors = {}, rentErrors = {} }: Props) {
  return (
    <>
      {/* Buying Parameters */}
      <div className="glass-card p-[24px] rounded-xl flex flex-col gap-[24px]">
        <div className="flex items-center gap-[12px] border-b border-border-subtle pb-[12px]">
          <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">home</span>
          <h2 className="text-headline-md font-semibold text-on-surface">Buying Parameters</h2>
        </div>

        {/* Key sliders */}
        <div className="flex flex-col gap-[24px]">
          <SliderField
            label="Home Price"
            displayValue={fmtDollar.format(buy.homePrice)}
            value={buy.homePrice}
            min={50_000}
            max={2_500_000}
            step={5_000}
            onChange={v => onBuyChange('homePrice', v)}
          />
          <SliderField
            label={`Down Payment (${pct(buy.downPaymentPct).toFixed(0)}%)`}
            displayValue={fmtDollar.format(buy.homePrice * buy.downPaymentPct)}
            value={pct(buy.downPaymentPct)}
            min={0}
            max={50}
            step={1}
            onChange={v => onBuyChange('downPaymentPct', v / 100)}
          />
          <SliderField
            label="Mortgage Rate"
            displayValue={`${pct(buy.mortgageRate).toFixed(2)}%`}
            value={pct(buy.mortgageRate)}
            min={1}
            max={15}
            step={0.125}
            onChange={v => onBuyChange('mortgageRate', v / 100)}
          />
        </div>

        {/* Secondary text fields */}
        <div className="flex flex-col gap-[10px] pt-[4px] border-t border-border-subtle">
          <Field
            id="buy-loanTermYears"
            label="Loan term"
            value={buy.loanTermYears}
            onChange={v => onBuyChange('loanTermYears', Math.round(v))}
            suffix="yrs"
            min={1}
            tooltip="How many years until your mortgage is fully paid off. Most people choose 30 years."
            error={buyErrors['loanTermYears']}
          />
          <Field
            id="buy-propertyTaxRate"
            label="Property tax"
            value={pct(buy.propertyTaxRate)}
            onChange={v => onBuyChange('propertyTaxRate', v / 100)}
            suffix="% / yr"
            step={0.1}
            tooltip="A yearly fee your local government charges just for owning a home. It's usually a percentage of what the home is worth."
            error={buyErrors['propertyTaxRate']}
          />
          <Field
            id="buy-insuranceRate"
            label="Insurance"
            value={pct(buy.insuranceRate)}
            onChange={v => onBuyChange('insuranceRate', v / 100)}
            suffix="% / yr"
            step={0.1}
            tooltip="Homeowner's insurance protects your home if it's damaged by fire, storms, or other events. This is the yearly cost."
            error={buyErrors['insuranceRate']}
          />
          <Field
            id="buy-monthlyHOA"
            label="HOA / maintenance"
            value={buy.monthlyHOA}
            onChange={v => onBuyChange('monthlyHOA', v)}
            prefix="$"
            suffix="/ mo"
            step={25}
            tooltip="HOA fees are monthly dues to maintain shared spaces like lobbies or pools. Maintenance covers things that break or wear out."
            error={buyErrors['monthlyHOA']}
          />
          <Field
            id="buy-closingCostsPct"
            label="Closing costs"
            value={pct(buy.closingCostsPct)}
            onChange={v => onBuyChange('closingCostsPct', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="Extra fees you pay when you finalize the home purchase — things like paperwork, bank fees, and title checks."
            error={buyErrors['closingCostsPct']}
          />
        </div>
      </div>

      {/* Renting Parameters */}
      <div className="glass-card p-[24px] rounded-xl flex flex-col gap-[24px]">
        <div className="flex items-center gap-[12px] border-b border-border-subtle pb-[12px]">
          <span className="material-symbols-outlined text-[20px] text-success-emerald" aria-hidden="true">payments</span>
          <h2 className="text-headline-md font-semibold text-on-surface">Renting Parameters</h2>
        </div>

        {/* Key sliders */}
        <div className="flex flex-col gap-[24px]">
          <SliderField
            label="Monthly Rent"
            displayValue={fmtDollar.format(rent.monthlyRent)}
            value={rent.monthlyRent}
            min={500}
            max={10_000}
            step={50}
            onChange={v => onRentChange('monthlyRent', v)}
            accent="emerald"
          />
          <SliderField
            label="Invested Savings Return"
            displayValue={`${(investmentReturn * 100).toFixed(1)}%`}
            value={investmentReturn * 100}
            min={1}
            max={20}
            step={0.5}
            onChange={v => onInvestmentReturnChange(v / 100)}
            accent="emerald"
          />
        </div>

        {/* Secondary text fields */}
        <div className="flex flex-col gap-[10px] pt-[4px] border-t border-border-subtle">
          <Field
            id="rent-annualRentIncrease"
            label="Annual rent increase"
            value={pct(rent.annualRentIncrease)}
            onChange={v => onRentChange('annualRentIncrease', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="How much your landlord raises the rent each year, shown as a percentage."
            error={rentErrors['annualRentIncrease']}
          />
          <Field
            id="rent-monthlyInsurance"
            label="Renter's insurance"
            value={rent.monthlyInsurance}
            onChange={v => onRentChange('monthlyInsurance', v)}
            prefix="$"
            suffix="/ mo"
            step={5}
            tooltip="Insurance that covers your stuff (furniture, electronics, clothes) if it's stolen or damaged."
            error={rentErrors['monthlyInsurance']}
          />
        </div>
      </div>
    </>
  );
}
