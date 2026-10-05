import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
// public/ is generated: remove stale assets, then copy only current site resources.
await rm('public', { recursive: true, force: true });
const paths = ['images/logo.png', 'images/optimized/avatar', 'images/optimized/gallery'];
for (const path of paths) {
  await mkdir(`public/${path.split('/').slice(0, -1).join('/')}`, { recursive: true });
  await cp(path, `public/${path}`, { recursive: true });
}
await writeFile('public/.nojekyll', '');
