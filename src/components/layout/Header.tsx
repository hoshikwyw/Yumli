import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { GlobeIcon, MoonIcon, SunIcon } from '../icons';
import { pageNavItems } from './navItems';

/* Square 44px control: big enough to hit first time on a phone. */
const controlClasses =
  'inline-flex items-center justify-center gap-1.5 min-h-11 min-w-11 px-2.5 ' +
  'bg-surface text-ink text-sm font-extrabold pixel-box-sm pixel-press';

/**
 * Sticky top bar. On phones it holds only the logo and the two settings
 * (language, theme): page links live in the bottom bar, within thumb reach.
 * From tablet width up the page links sit here instead.
 */
export default function Header() {
  const { toggleMode, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);

  const isBurmese = i18n.language === 'mm';
  const toggleLang = () => i18n.changeLanguage(isBurmese ? 'en' : 'mm');

  return (
    <header className="sticky top-0 z-40 bg-surface border-b-[3px] border-line pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0 min-h-11 no-underline" aria-label="Yumli">
          <span className="text-2xl" aria-hidden="true">🍳</span>
          <span className="font-pixel text-primary text-sm sm:text-base tracking-wide" aria-hidden="true">
            Yumli
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <nav aria-label={t('nav.main')} className="hidden md:flex items-center gap-1 mr-2">
            {pageNavItems.map((item) => {
              const active = item.isActive(pathname, params);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center min-h-11 px-4 text-base font-extrabold no-underline border-b-[3px] transition-colors ${
                    active
                      ? 'text-primary-ink border-primary'
                      : 'text-ink border-transparent hover:text-primary-ink'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Shows the language you would switch TO, written in that language. */}
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t('nav.language')}
            className={controlClasses}
          >
            <GlobeIcon className="w-5 h-5" />
            <span lang={isBurmese ? 'en' : 'my'}>{isBurmese ? 'English' : 'မြန်မာ'}</span>
          </button>

          <button
            type="button"
            onClick={toggleMode}
            aria-label={isDark ? t('nav.lightMode') : t('nav.darkMode')}
            title={isDark ? t('nav.lightMode') : t('nav.darkMode')}
            className={controlClasses}
          >
            {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
