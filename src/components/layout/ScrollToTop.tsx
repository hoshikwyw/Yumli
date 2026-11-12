import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * What a browser does by itself on a normal page load, done for in-app
 * navigation: start the new page at the top, and move keyboard and
 * screen-reader focus to its content (otherwise focus stays on the link that
 * was clicked, in a page that no longer exists).
 *
 * Going back or forward is left alone, so the browser can return people to
 * where they were in a list.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const isFirstPage = useRef(true);

  useEffect(() => {
    // The first page is a real page load: the browser has already handled it.
    if (isFirstPage.current) {
      isFirstPage.current = false;
      return;
    }
    if (navigationType === 'POP') return;
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, navigationType]);

  return null;
}
