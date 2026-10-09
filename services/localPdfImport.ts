import type { LocalLabDraft } from './localLabParser';
import type { DocumentPickerAsset } from 'expo-document-picker';
export async function importLocalPdf(_file: DocumentPickerAsset): Promise<LocalLabDraft> {
  throw new Error('web-only');
}
