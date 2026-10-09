// Serve the verified, locked dependency locally instead of fetching WASM from a CDN.
const fs = require('node:fs');
const path = require('node:path');
const source = path.join(path.dirname(require.resolve('@lottiefiles/dotlottie-web')), 'dotlottie-player.wasm');
const destination = path.join(__dirname, '..', 'public');
fs.mkdirSync(destination, { recursive: true });
fs.copyFileSync(source, path.join(destination, 'dotlottie-player.wasm'));

// Copy the installed, locked PDF.js modules; the loader and worker stay on this origin.
const pdfRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));
for (const filename of ['pdf.mjs', 'pdf.worker.min.mjs']) {
  fs.copyFileSync(path.join(pdfRoot, 'build', filename), path.join(destination, filename));
}
