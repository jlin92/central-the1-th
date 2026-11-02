import type { ReactNode } from 'react';
import { useDemo } from '@/app/DemoContext';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/hooks/utils';

/** White section card used on The 1 home: title row with chevron, then content. */
export function HomeSection({
  title,
  onMore,
  children,
  why,
  subtitle,
  className,
}: {
  title: string;
  onMore?: () => void;
  children: ReactNode;
  /** Shows the "Why this?" affordance that opens the reasoning rail. */
  why?: boolean;
  subtitle?: ReactNode;
  className?: string;
}) {
  const { openWhy } = useDemo();
  return (
    <section className={cn('rounded-2xl bg-white p-3 shadow-card', className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-[15px] font-bold text-on-surface">{title}</h2>
        <div className="flex items-center gap-1.5">
          {why && <WhyButton onClick={openWhy} />}
          {onMore && (
            <button type="button" onClick={onMore} aria-label={`More ${title}`} className="flex h-6 w-6 items-center justify-center text-on-surface">
              <Icon name="chevron_right" className="text-[20px]" />
            </button>
          )}
        </div>
      </div>
      {subtitle && <div className="mt-0.5 text-[11px] text-on-surface-variant">{subtitle}</div>}
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

/** Horizontal carousel of fixed-width cards with hidden scrollbar. */
export function Carousel({ children, itemWidth = 'w-[46%]' }: { children: ReactNode[]; itemWidth?: string }) {
  return (
    <div className="no-scrollbar -mx-3 flex items-stretch gap-2.5 overflow-x-auto px-3 pb-1">
      {children.map((c, i) => (
        <div key={i} className={cn('flex shrink-0', itemWidth)}>
          {c}
        </div>
      ))}
    </div>
  );
}

/** Small "Why this?" affordance that opens the reasoning rail. */
export function WhyButton({ onClick, className, dark }: { onClick: () => void; className?: string; dark?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Why is this shown now?"
      className={cn(
        'flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold',
        dark ? 'bg-white/20 text-white' : 'bg-surface text-on-surface-variant',
        className,
      )}
    >
      <Icon name="info" className="text-[13px]" />
      Why this?
    </button>
  );
}

/** Outlined filter chip as on the Search screen. */
export function Chip({ label, icon, active, onClick }: { label: string; icon?: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
        active ? 'border-on-surface bg-on-surface text-white' : 'border-outline-variant bg-white text-on-surface',
      )}
    >
      {icon && <Icon name={icon} className="text-[15px]" />}
      {label}
    </button>
  );
}

/** Plain section heading with optional trailing action. */
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-heading text-[16px] font-bold text-on-surface">{title}</h2>
      {action && (
        <button type="button" onClick={onAction} className="flex items-center text-[13px] font-semibold text-primary">
          {action}
          <Icon name="chevron_right" className="text-[18px]" />
        </button>
      )}
    </div>
  );
}

/** Thin DY sort indicator shown above personalised lists. */
export function SortIndicator({ label, onWhy, live }: { label: string; onWhy?: () => void; live?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-card">
      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-on-surface">
        <Icon name={live ? 'bolt' : 'swap_vert'} filled={live} className={cn('text-[16px]', live ? 'text-primary' : 'text-on-surface-variant')} />
        {label}
      </span>
      {onWhy && (
        <button type="button" onClick={onWhy} className="text-[12px] font-semibold text-primary">
          Why this order?
        </button>
      )}
    </div>
  );
}
