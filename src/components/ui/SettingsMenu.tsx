import { useState, useEffect, useRef } from 'react';

export function SettingsMenu() {
  const [isLight, setIsLight] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLight(document.documentElement.dataset.theme === 'light');
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative" data-print="hide">
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-xs rounded-lg hover:bg-surface-container-high"
      >
        settings
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-surface-elevated border border-border-subtle rounded-xl shadow-lg p-2 min-w-[180px] z-50">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors text-label-md font-medium"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {isLight ? 'dark_mode' : 'light_mode'}
            </span>
            {isLight ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      )}
    </div>
  );
}
