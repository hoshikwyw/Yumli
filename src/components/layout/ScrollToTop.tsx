import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * What a browser does by itself on a normal page load, done for in-app
 * navigation: start the new page at the top, and move keyboard and
 * screen-reader focus to its content (otherwise focus stays on the link that
 * was clicked, in a page that no longer exists).
 *
 * Going back or forward is left alone, so the browser can return people to
 * where they were in a list. So is a change that keeps the same page, such as
 * the recipe filters rewriting the query string: taking focus then would pull
 * the cursor out of the search box mid-word.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const shownPath = useRef(pathname);

  useEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;
    if (navigationType === 'POP') return;
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, navigationType]);

  return null;
}
