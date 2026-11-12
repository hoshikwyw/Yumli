import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import BottomNav from './BottomNav';
import Footer from './Footer';
import PageTransition from './PageTransition';

/** Frame around every public page: header, page content, footer, and the phone bottom bar. */
export default function PublicLayout() {
  const { t } = useTranslation();

  return (
    // Bottom padding on phones keeps the footer clear of the fixed bottom bar.
    <div className="min-h-dvh flex flex-col pb-[calc(4rem+3px+env(safe-area-inset-bottom,0px))] md:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-3 focus:bg-surface focus:text-ink focus:font-extrabold focus:pixel-box-sm"
      >
        {t('nav.skip')}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
