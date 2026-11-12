import { useEffect } from 'react';

const SITE = 'Yumli';

/** Sets the browser tab title to "<title> · Yumli", or just "Yumli" when no title is given. */
export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE;
  }, [title]);
}
