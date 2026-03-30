import { useCallback } from 'react';
import { useStore } from './useStore';
import { t, TranslationKey } from '../constants/i18n';

/**
 * Returns a memoised translation function bound to the current language.
 * Re-creates only when `language` changes, triggering re-renders in consumers.
 */
export function useT() {
  const language = useStore((s) => s.language);
  return useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      t(language, key, vars),
    [language],
  );
}
