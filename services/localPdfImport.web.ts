import type { DocumentPickerAsset } from 'expo-document-picker';
import { parseRalyPages, type LocalLabDraft, type PdfTextPage } from './localLabParser';

type PdfDocument = { numPages: number; getPage(n: number): Promise<{ getTextContent(): Promise<{ items: unknown[] }> }>; destroy(): Promise<void> };
type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(options: { data: Uint8Array; isEvalSupported: boolean; useSystemFonts: boolean }): {
    promise: Promise<PdfDocument>; destroy(): Promise<void>;
  };
};
let loading: Promise<PdfJs> | null = null;
function loadPdfJs(): Promise<PdfJs> {
  if (loading) return loading;
  loading = new Promise<PdfJs>((resolve,reject) => {
    const script = document.createElement('script');
    script.type = 'module'; script.src = '/local-pdf-loader.mjs';
    const ready = (event: Event) => {
      cleanup(); const lib = (event as CustomEvent<PdfJs>).detail;
      lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'; resolve(lib);
    };
    const cleanup = () => { window.removeEventListener('clyra-pdf-ready', ready); clearTimeout(timer); };
    const failed = () => { cleanup(); script.remove(); reject(new Error('dependency-unavailable')); };
    const timer = setTimeout(failed, 15000);
    window.addEventListener('clyra-pdf-ready', ready, { once:true }); script.onerror = failed;
    document.head.appendChild(script);
  }).catch(error => { loading = null; throw error; });
  return loading;
}
const MAX_BYTES = 10 * 1024 * 1024;
export async function importLocalPdf(file: DocumentPickerAsset): Promise<LocalLabDraft> {
  if (file.size != null && file.size > MAX_BYTES) throw new Error('size');
  // DocumentPicker supplies the browser File; fetching fallback only accepts local picker URIs.
  let bytes: ArrayBuffer;
  if (file.file) bytes = await file.file.arrayBuffer();
  else {
    if (!/^(blob:|data:)/.test(file.uri)) throw new Error('invalid');
    const response = await fetch(file.uri); bytes = await response.arrayBuffer();
  }
  if (bytes.byteLength > MAX_BYTES) throw new Error('size');
  const header = new TextDecoder().decode(new Uint8Array(bytes,0,Math.min(bytes.byteLength,1024)));
  if (!header.includes('%PDF-')) throw new Error('invalid');
  const lib = await loadPdfJs();
  let task: ReturnType<PdfJs['getDocument']> | undefined;
  try {
    // The file never leaves this browser. PDF.js evaluates neither PDF scripts nor arbitrary code.
    const contentHash = globalThis.crypto?.subtle
      ? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b => b.toString(16).padStart(2,'0')).join('')
      : undefined;
    task = lib.getDocument({ data:new Uint8Array(bytes), isEvalSupported:false, useSystemFonts:true });
    const pdf = await task.promise;
    if (pdf.numPages > 30) throw new Error('size');
    const pages: PdfTextPage[] = [];
    for (let n=1;n<=pdf.numPages;n++) {
      const page = await pdf.getPage(n), content = await page.getTextContent();
      const items: PdfTextPage = [];
      for (const entry of content.items) {
        const item = entry as { str?: string; transform?: number[] };
        if (typeof item.str === 'string' && item.transform?.length === 6) items.push({ text:item.str, x:item.transform[4], y:item.transform[5] });
      }
      pages.push(items);
    }
    if (!pages.some(p => p.some(i => i.text.trim()))) throw new Error('scanned');
    return { ...parseRalyPages(pages), contentHash };
  } catch (error) {
    const name = error instanceof Error ? error.name : '';
    if (name === 'PasswordException') throw new Error('encrypted');
    if (name === 'InvalidPDFException' || name === 'MissingPDFException') throw new Error('invalid');
    throw error;
  } finally { await task?.destroy(); }
}
