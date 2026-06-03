const KOFI_URL = 'https://ko-fi.com/paynekerz';

interface Props {
  label?: string;
}

export function KofiButton({ label = '☕ Buy me a coffee' }: Props) {
  return (
    <a
      href={KOFI_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      {label}
    </a>
  );
}
