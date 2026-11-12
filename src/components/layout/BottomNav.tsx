import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navItems } from './navItems';

/**
 * Phone navigation: a bar fixed to the bottom of the screen, where the thumb
 * already is. Every page is one tap away, with an icon AND a word, so nobody
 * has to guess what a hamburger menu hides. Hidden from tablet width up.
 */
export default function BottomNav() {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);

  return (
    <nav
      aria-label={t('nav.main')}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t-[3px] border-line pb-safe"
    >
      <ul className="flex">
        {navItems.map(({ to, labelKey, icon: Icon, isActive }) => {
          const active = isActive(pathname, params);
          return (
            <li key={to} className="flex-1 min-w-0">
              <Link
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 h-16 px-1 no-underline text-[0.8125rem] leading-tight font-extrabold ${
                  active ? 'text-primary-ink' : 'text-ink-soft'
                }`}
              >
                <span
                  className={`flex items-center justify-center w-14 h-8 rounded-full transition-colors ${
                    active ? 'bg-primary-soft' : ''
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </span>
                <span className="truncate max-w-full">{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
