import { useTranslation } from 'react-i18next';
import { Toaster as DingToaster } from '@yusufceng1z/ding-react';
import { useTheme } from '@/features/theme/ThemeContext';

/**
 * Where notifications appear. Rendered once, at the top of the app.
 * It follows the site's light/dark choice and language; its colours are set
 * in styles/index.css (look for `.tst-viewport`). Top of the screen on
 * purpose: on phones the bottom belongs to the navigation bar.
 */
export default function Toaster() {
  const { mode } = useTheme();
  const { t } = useTranslation();

  return (
    <DingToaster
      position="top-center"
      theme={mode}
      labels={{ region: t('toast.region'), dismiss: t('toast.dismiss') }}
    />
  );
}
