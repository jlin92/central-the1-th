import type { ReactNode } from 'react';

/** Scrollable content region for a chapter. */
export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex-1 overflow-y-auto bg-surface pb-28 no-scrollbar ${className}`}>{children}</div>;
}
