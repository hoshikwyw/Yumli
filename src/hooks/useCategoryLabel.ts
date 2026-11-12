import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Category names are typed by the admin in one language. The built-in ones
 * have translations (keyed by slug); any other falls back to the name as typed.
 */
export function useCategoryLabel() {
  const { t } = useTranslation();
  return useCallback(
    (slug: string | undefined, name: string) =>
      slug ? t(`categories.${slug}`, { defaultValue: name }) : name,
    [t],
  );
}
