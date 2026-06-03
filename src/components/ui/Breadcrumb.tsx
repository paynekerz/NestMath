interface BreadcrumbProps {
  tool: string;
}

export function Breadcrumb({ tool }: BreadcrumbProps) {
  return (
    <nav
      data-print="hide"
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-label-sm text-on-surface-variant py-3 max-w-[1280px] mx-auto px-gutter"
    >
      <a href="/" className="hover:text-primary transition-colors">
        Home
      </a>
      <span aria-hidden="true" className="text-outline mx-1">›</span>
      <span aria-current="page">{tool}</span>
    </nav>
  );
}
