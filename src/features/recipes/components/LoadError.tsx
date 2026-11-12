import { useTranslation } from 'react-i18next';
import { Button, StateMessage } from '@/components/ui';

/** Shown when recipes could not be fetched: says so, and offers to try again. */
export default function LoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <StateMessage
      alert
      icon="sad"
      title={t('common.loadError')}
      action={<Button variant="primary" onClick={onRetry}>{t('common.retry')}</Button>}
    />
  );
}
