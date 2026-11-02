import { brandStyle } from '@/mock-data/offers';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/hooks/utils';

const fontClass: Record<NonNullable<ReturnType<typeof brandStyle>['font']>, string> = {
  serif: 'font-serif font-bold tracking-wide',
  sans: 'font-sans font-semibold tracking-wide',
  black: 'font-heading font-black tracking-tight',
  italic: 'font-heading font-black italic tracking-tight',
};

interface BrandTileProps {
  brandId: string;
  className?: string;
  /** Wordmark size. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Round avatar for the home brand row. */
  round?: boolean;
}

/**
 * Brand logo stand-in: the live app shows partner logos on solid colour
 * blocks; we render the wordmark on the brand colour so no remote assets are
 * needed and nothing can 404 during a live demo.
 */
export function BrandTile({ brandId, className, size = 'md', round }: BrandTileProps) {
  const s = brandStyle(brandId);
  const text = { xs: 'text-[9px]', sm: 'text-[11px]', md: 'text-[15px]', lg: 'text-[20px]' }[size];
  const icon = { xs: 'text-[14px]', sm: 'text-[18px]', md: 'text-[26px]', lg: 'text-[34px]' }[size];
  const isGradient = s.bg.startsWith('linear');
  return (
    <div
      className={cn('flex items-center justify-center overflow-hidden', round ? 'rounded-full' : 'rounded-none', className)}
      style={{ background: isGradient ? s.bg : undefined, backgroundColor: isGradient ? undefined : s.bg, color: s.fg }}
      aria-label={s.label}
      role="img"
    >
      <div className={cn('flex flex-col items-center justify-center gap-0.5 px-2 text-center leading-none', fontClass[s.font ?? 'black'])}>
        {s.icon && !round && <Icon name={s.icon} filled className={cn(icon)} style={{ color: s.accent ?? s.fg }} />}
        {s.icon && round && size === 'xs' ? (
          <Icon name={s.icon} filled className="text-[18px]" />
        ) : (
          <span className={cn(round ? 'max-w-full break-words px-1 text-[8px] leading-[1.05]' : text)}>{s.label}</span>
        )}
      </div>
    </div>
  );
}
