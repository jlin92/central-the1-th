import type { CSSProperties } from 'react';
import { cn } from '@/hooks/utils';

interface IconProps {
  /** Material Symbols Outlined ligature name, e.g. "home", "shopping_bag". */
  name: string;
  className?: string;
  filled?: boolean;
  style?: CSSProperties;
  ariaHidden?: boolean;
}

/** Renders a Material Symbols Outlined icon. */
export function Icon({ name, className, filled, style, ariaHidden = true }: IconProps) {
  return (
    <span aria-hidden={ariaHidden} style={style} className={cn('material-symbols-outlined', filled && 'filled', className)}>
      {name}
    </span>
  );
}
