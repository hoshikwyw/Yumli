import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Container, Button } from '../components/common';

export default function NotFound() {
  const { t } = useTranslation();
  useDocumentTitle(t('notFound.title'));

  return (
    <div className="bg-bg pixel-hearts min-h-[70vh] flex items-center justify-center py-12">
      <Container>
        <div className="text-center max-w-md mx-auto">
          <div className="font-pixel text-primary text-5xl sm:text-7xl leading-none" aria-hidden="true">
            404
          </div>
          <div className="text-5xl mt-5" aria-hidden="true">🍳</div>
          <h1 className="text-title text-ink mt-5">{t('notFound.title')}</h1>
          <p className="text-lead text-ink-soft mt-3">{t('notFound.text')}</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-center mt-7">
            <Button to="/" variant="primary">{t('notFound.home')}</Button>
            <Button to="/recipes" variant="outline">{t('notFound.recipes')}</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
