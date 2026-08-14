import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

/**
 * Copies the pdf.js worker into public/ so it is served from our own origin.
 *
 * It used to be loaded from unpkg.com at runtime, which meant third-party code
 * executed in a user's browser on every upload, broke offline, and blocked any
 * future CSP. Runs on postinstall and prebuild so the copy cannot drift from
 * the installed pdfjs-dist version.
 */
const require = createRequire(import.meta.url);
const pdfjsRoot = dirname(require.resolve('pdfjs-dist/package.json'));
const source = join(pdfjsRoot, 'build', 'pdf.worker.min.mjs');
const targetDir = join(process.cwd(), 'public', 'pdfjs');

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, join(targetDir, 'pdf.worker.min.mjs'));

const { version } = require('pdfjs-dist/package.json');
console.log(`Copied pdf.js worker (v${version}) to public/pdfjs/`);
