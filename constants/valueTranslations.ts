/**
 * Translates common biomarker value strings (extracted from Spanish PDFs)
 * into the user's chosen language.
 */
export function translateBiomarkerValue(
  value: string | number,
  language: string,
): string {
  if (typeof value === 'number') return String(value);
  const v = String(value).trim().toLowerCase();

  const translations: Record<string, Record<string, string>> = {
    'negativo':      { en: 'Negative',     es: 'Negativo' },
    'positivo':      { en: 'Positive',     es: 'Positivo' },
    'normal':        { en: 'Normal',       es: 'Normal' },
    'reactivo':      { en: 'Reactive',     es: 'Reactivo' },
    'no reactivo':   { en: 'Non-Reactive', es: 'No Reactivo' },
    'no detectado':  { en: 'Not Detected', es: 'No Detectado' },
    'detectado':     { en: 'Detected',     es: 'Detectado' },
    'presente':      { en: 'Present',      es: 'Presente' },
    'ausente':       { en: 'Absent',       es: 'Ausente' },
    'trazas':        { en: 'Traces',       es: 'Trazas' },
    'escaso':        { en: 'Scarce',       es: 'Escaso' },
    'abundante':     { en: 'Abundant',     es: 'Abundante' },
    'moderado':      { en: 'Moderate',     es: 'Moderado' },
    'claro':         { en: 'Clear',        es: 'Claro' },
    'turbio':        { en: 'Cloudy',       es: 'Turbio' },
    'amarillo':      { en: 'Yellow',       es: 'Amarillo' },
  };

  const match = translations[v];
  if (match) return match[language] ?? match['en'] ?? String(value);
  return String(value);
}
