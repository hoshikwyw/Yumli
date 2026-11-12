import type { ReactNode, CSSProperties } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'warm' | 'sky' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/* The colour lives in the border and background; the text stays ink so it is always readable. */
const variants: Record<BadgeVariant, string> = {
  primary: 'bg-primary-soft border-primary',
  secondary: 'bg-secondary-soft border-secondary',
  accent: 'bg-accent-soft border-accent',
  warm: 'bg-warm-soft border-warm',
  sky: 'bg-sky-soft border-sky',
  outline: 'bg-transparent border-line',
};

export default function Badge({
  variant = 'primary',
  children,
  className = '',
  style,
}: BadgeProps) {
  return (
    <span
      style={style}
      className={`inline-flex items-center border-2 px-2.5 py-1 text-[0.8125rem] leading-tight font-extrabold tracking-wide text-ink ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
