import type { ReactNode, CSSProperties } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  size?: 'sm' | 'md' | 'lg';
}

const maxWidths = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
};

export default function Container({
  children,
  className = '',
  style,
  size = 'lg',
}: ContainerProps) {
  return (
    <div
      style={style}
      className={`${maxWidths[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
