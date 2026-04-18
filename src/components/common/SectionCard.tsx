import * as React from 'react';
import { cn } from '@/lib/cn';

interface SectionCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tone?: 'normal' | 'warn' | 'danger';
}

/** Consistent gothic card frame used by all tracker sections. */
export function SectionCard({
  title,
  subtitle,
  actions,
  tone = 'normal',
  className,
  children,
  ...props
}: SectionCardProps) {
  const toneBorder =
    tone === 'danger'
      ? 'border-danger/60 shadow-glow'
      : tone === 'warn'
        ? 'border-warn/60'
        : 'border-ink-3';
  return (
    <section
      className={cn(
        'rounded-lg border bg-ink-1/90 p-4 transition-colors',
        toneBorder,
        className,
      )}
      {...props}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-base uppercase tracking-wider text-bone">{title}</h2>
          {subtitle ? <p className="text-xs text-bone-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}
