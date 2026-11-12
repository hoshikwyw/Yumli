import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * Slides each page in. The key restarts the CSS animation whenever the path
 * changes, with no state and no blank frame in between.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
