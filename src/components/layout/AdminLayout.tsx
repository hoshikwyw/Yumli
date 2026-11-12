import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge, Button } from '../common';
import { MoonIcon, SunIcon } from '../icons';

/**
 * Frame and gatekeeper for every admin screen. The login check lives here
 * once, so no admin page can forget it: signed-out visitors are sent to the
 * login page and brought back to where they were going afterwards.
 */
export default function AdminLayout() {
  const { isLoggedIn, checking, logout } = useAuth();
  const { toggleMode, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (checking) {
    return (
      <div role="status" className="min-h-dvh bg-bg flex items-center justify-center text-base text-ink-muted">
        Checking your login…
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 bg-surface border-b-[3px] border-line pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link to="/admin" className="flex items-center gap-2 min-h-11 no-underline shrink-0">
            <span className="text-2xl" aria-hidden="true">🍳</span>
            <span className="hidden sm:inline font-pixel text-primary text-sm tracking-wide">Yumli</span>
            <Badge variant="secondary">Admin</Badge>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button to="/" variant="ghost" size="sm" className="px-3">View site</Button>
            <button
              type="button"
              onClick={toggleMode}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center w-11 h-11 text-ink hover:bg-surface-alt"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <Button variant="outline" size="sm" onClick={handleLogout}>Log out</Button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
