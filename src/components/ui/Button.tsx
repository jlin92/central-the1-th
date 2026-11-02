import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/hooks/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-container active:scale-[0.98]',
  secondary: 'bg-on-surface text-white hover:bg-black active:bg-black',
  ghost: 'bg-transparent text-on-surface hover:bg-black/5 active:bg-black/10',
  outline:
    'bg-surface-container-lowest text-primary border border-primary/40 hover:border-primary hover:bg-primary/[0.03]',
  success: 'bg-success text-white hover:brightness-105 active:brightness-95',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-2 rounded-md',
  md: 'text-sm px-4 py-3 rounded-md',
  lg: 'text-base px-5 py-4 rounded-md',
};

/** Primary interactive button with subtle press motion. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, className, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-heading font-bold transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
});
