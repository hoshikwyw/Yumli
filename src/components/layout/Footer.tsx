import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { pageNavItems } from './navItems';

/**
 * The footer is a dark band in both themes, so its colours are fixed here
 * instead of coming from the theme tokens (which flip in dark mode).
 */
export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#2B2B3D] dark:bg-[#12121F] text-[#F1EEE9]">
      <div className="pixel-divider-primary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          {/* Brand */}
          <div>
            <span className="font-pixel text-primary text-base tracking-wide">Yumli</span>
            <p className="mt-3 text-base text-[#C9C2D6] whitespace-pre-line max-w-sm">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Links */}
          <nav aria-label={t('footer.navigate')}>
            <h2 className="text-eyebrow text-primary mb-1">{t('footer.navigate')}</h2>
            <ul>
              {pageNavItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex items-center min-h-11 text-base font-semibold text-[#C9C2D6] no-underline hover:text-white hover:underline underline-offset-4"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 pt-5 border-t-2 border-[#4A4A63] flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-[#C9C2D6]">
          <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
          <div className="flex items-center gap-2">
            <p>{t('footer.madeWith')}</p>
            {/* Quiet door to the admin area: discreet to look at, still reachable by keyboard and touch. */}
            <Link
              to="/admin"
              aria-label={t('nav.admin')}
              className="inline-flex items-center justify-center w-11 h-11 no-underline text-[#8E88A8] hover:text-primary"
            >
              <span aria-hidden="true" className="flex items-center justify-center w-6 h-6 rounded-full border border-current text-sm leading-none">
                +
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
