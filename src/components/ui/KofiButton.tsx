const KOFI_URL = 'https://ko-fi.com/paynekerz';

interface Props {
  message: string;
  label?: string;
  className?: string;
}

export function KofiButton({ message, label = '☕ a coffee seems fair.', className = 'mt-6' }: Props) {
  return (
    <p data-print="hide" className={`text-body-sm text-center text-on-surface-variant ${className}`}>
      {message}{' '}
      <a href={KOFI_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        {label}
      </a>
    </p>
  );
}
