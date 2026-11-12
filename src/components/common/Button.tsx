import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the width of the parent: the usual choice for the main action on a phone. */
  fullWidth?: boolean;
  /** Render as a router link that looks like a button. Use this instead of wrapping a Button in a Link. */
  to?: string;
  children: ReactNode;
  style?: CSSProperties;
}

/* Every size is at least 44px tall: a comfortable target for small and unsteady fingers. */
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm',
  md: 'min-h-12 px-6 text-base',
  lg: 'min-h-14 px-8 text-lg',
};

const boxes: Record<ButtonSize, string> = {
  sm: 'pixel-box-sm',
  md: 'pixel-box',
  lg: 'pixel-box',
};

const fills: Record<Exclude<ButtonVariant, 'ghost' | 'danger'>, string> = {
  primary: 'bg-primary text-on-fill',
  secondary: 'bg-secondary text-on-fill',
  accent: 'bg-accent text-on-fill',
  outline: 'bg-surface text-ink',
};

const flat: Record<'ghost' | 'danger', string> = {
  ghost: 'text-ink hover:bg-surface-alt',
  danger: 'text-primary-ink hover:bg-primary-soft',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  to,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const look =
    variant === 'ghost' || variant === 'danger'
      ? `border-2 border-transparent transition-colors ${flat[variant]}`
      : `${boxes[size]} pixel-press ${fills[variant]}`;

  const classes = [
    'inline-flex items-center justify-center gap-2 py-2',
    'font-body font-extrabold tracking-wide text-center leading-tight no-underline select-none',
    'disabled:opacity-60 disabled:pointer-events-none',
    sizes[size],
    look,
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  if (to !== undefined) {
    return (
      <Link to={to} className={classes} style={props.style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
