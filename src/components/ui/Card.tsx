import type { ReactNode } from 'react';
import { cn } from '@/hooks/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

/** Rounded white surface with soft shadow — the base building block. */
export function Card({ children, className, padded = true }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-surface-container-lowest shadow-card',
        padded && 'p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Small compliant disclaimer line. */
export function Disclaimer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-[11px] leading-snug text-on-surface-variant', className)}>{children}</p>
  );
}

/** Section heading with the chapter copy styling. */
export function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-3', className)}>
      {eyebrow && (
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading text-xl font-bold leading-tight text-on-surface">{title}</h2>
    </div>
  );
}
