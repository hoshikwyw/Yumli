import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from './icons';

interface BackLinkProps {
  to: string;
  children: ReactNode;
  /** Runs before navigating; call `preventDefault()` on the event to stay on the page. */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

/** "← Somewhere" link shown above a page's title, sized as a full tap target. */
export default function BackLink({ to, children, onClick, className = '' }: BackLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 min-h-11 text-base font-extrabold text-ink-soft no-underline hover:text-primary-ink ${className}`}
    >
      <ArrowLeftIcon className="w-5 h-5" />
      {children}
    </Link>
  );
}
