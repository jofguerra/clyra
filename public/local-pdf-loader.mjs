// Locally served PDF.js assets are copied from the installed, locked dependency.
import * as pdfjs from './pdf.mjs';
globalThis.dispatchEvent(new CustomEvent('clyra-pdf-ready', { detail: pdfjs }));
