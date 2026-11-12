import type { ReactNode, CSSProperties } from 'react';

type CardVariant = 'default' | 'pixel' | 'pastel-pink' | 'pastel-lavender' | 'pastel-mint' | 'pastel-yellow';

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Lift on hover and sink on press: for cards that are themselves clickable. */
  hover?: boolean;
}

const variants: Record<CardVariant, string> = {
  default: 'bg-surface pixel-box',
  pixel: 'bg-surface pixel-box',
  'pastel-pink': 'bg-primary-soft pixel-box-primary',
  'pastel-lavender': 'bg-secondary-soft pixel-box-secondary',
  'pastel-mint': 'bg-accent-soft pixel-box-accent',
  'pastel-yellow': 'bg-warm-soft pixel-box-warm',
};

export default function Card({
  variant = 'default',
  children,
  className = '',
  style,
  hover = false,
}: CardProps) {
  return (
    <div
      style={style}
      className={`overflow-hidden text-ink ${variants[variant]} ${hover ? 'pixel-press' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
