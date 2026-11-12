import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/features/theme/ThemeContext';
import { Badge, Button, Logo } from '@/components/ui';
import { MoonIcon, SunIcon } from '@/components/ui/icons';
import { notify } from '@/lib/notify';

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
    notify.info('Logged out');
    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 bg-surface border-b-[3px] border-line pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link to="/admin" aria-label="Yumli admin" className="flex items-center gap-2 min-h-11 no-underline shrink-0">
            <Logo nameClassName="hidden sm:inline text-ink" />
            <Badge variant="secondary" className="hidden min-[360px]:inline-flex">Admin</Badge>
          </Link>

          {/* The theme switch is left out on phones to keep this row on one line; it is on every public page. */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button to="/" variant="ghost" size="sm" className="px-2.5 whitespace-nowrap">View site</Button>
            <button
              type="button"
              onClick={toggleMode}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hidden sm:inline-flex items-center justify-center w-11 h-11 text-ink hover:bg-surface-alt"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="px-3 whitespace-nowrap">Log out</Button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
    </div>
  );
}
