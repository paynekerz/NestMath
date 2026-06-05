import { useState, useEffect } from 'react';
import type { InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: number;
  onChange: (value: number) => void;
};

export function NumericInput({ value, onChange, ...rest }: Props) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  return (
    <input
      type="number"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        const parsed = parseFloat(draft);
        onChange(isNaN(parsed) ? 0 : parsed);
      }}
      {...rest}
    />
  );
}
