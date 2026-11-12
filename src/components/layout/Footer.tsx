import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, PixelArt, type SpriteName } from '@/components/ui';
import { pageNavItems } from './navItems';

/** A little parade of food under the tagline. */
const PARADE: SpriteName[] = ['egg', 'pot', 'noodles', 'salad', 'cake', 'cookie'];

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2.5 min-h-11 text-base font-semibold text-[#C9C2D6] no-underline hover:text-white"
    >
      {/* A pixel for a bullet: it lights up when the link is pointed at */}
      <span aria-hidden="true" className="w-1.5 h-1.5 bg-[#6B6580] transition-colors group-hover:bg-primary" />
      <span className="group-hover:underline underline-offset-4">{children}</span>
    </Link>
  );
}

/**
 * The footer is a dark band in both themes, so its colours are fixed here
 * instead of coming from the theme tokens (which flip in dark mode). The
 * sprite outline is set darker than the band for the same reason.
 */
export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#2B2B3D] dark:bg-[#12121F] text-[#F1EEE9] [--color-sprite-ink:#14141F]">
      <div className="pixel-divider-primary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr] gap-x-6 gap-y-9">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo nameClassName="text-white" />
            <p className="mt-4 text-base text-[#C9C2D6] whitespace-pre-line max-w-sm">
              {t('footer.tagline')}
            </p>
            <div aria-hidden="true" className="mt-5 flex flex-wrap gap-3">
              {PARADE.map((name) => (
                <PixelArt key={name} name={name} className="w-8 h-8" />
              ))}
            </div>
          </div>

          {/* Pages */}
          <nav aria-label={t('footer.navigate')}>
            <h2 className="text-eyebrow text-primary mb-2">{t('footer.navigate')}</h2>
            <ul>
              {pageNavItems.map((item) => (
                <li key={item.to}>
                  <FooterLink to={item.to}>{t(item.labelKey)}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Shortcuts into the recipe list */}
          <nav aria-label={t('footer.shortcuts')}>
            <h2 className="text-eyebrow text-primary mb-2">{t('footer.shortcuts')}</h2>
            <ul>
              <li><FooterLink to="/recipes?saved=1">{t('nav.saved')}</FooterLink></li>
              <li><FooterLink to="/recipes?quick=1">{t('home.pickQuick')}</FooterLink></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 pt-4 border-t-2 border-[#4A4A63] flex flex-col-reverse sm:flex-row justify-between items-center gap-x-4 text-sm text-[#C9C2D6]">
          <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
          <div className="flex items-center gap-1">
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
