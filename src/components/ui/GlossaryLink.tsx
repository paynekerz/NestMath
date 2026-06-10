interface GlossaryLinkProps {
  id: string;
  children: React.ReactNode;
}

export function GlossaryLink({ id, children }: GlossaryLinkProps) {
  return (
    <a
      href={`/glossary#${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors"
    >
      {children}
    </a>
  );
}
