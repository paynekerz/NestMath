// Runs the math audit. The calculator libs import each other without file
// extensions, which Node's ESM loader can't resolve directly, so we bundle
// with esbuild first (esbuild is already a dev dependency), then import the
// bundle. Exits non-zero if any check fails, so it can gate the build.
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(mkdtempSync(join(tmpdir(), 'nestmath-math-')), 'math-check.mjs');

await build({
  entryPoints: [join(here, 'math-check.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'error',
});

await import(pathToFileURL(out).href);
