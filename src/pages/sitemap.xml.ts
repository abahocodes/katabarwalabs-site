import type { APIRoute } from 'astro';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Dependency-free sitemap generated from the pages that actually exist, so a
// new app or blog post is never forgotten. lastmod is the last git commit that
// touched the page (falls back to the build date for uncommitted files).
// URLs use the production origin plus the build base so the preview build is
// self-consistent, while every page's <link rel=canonical> still points at
// katabarwalabs.dev.
const origin = (import.meta.env.SITE ?? 'https://katabarwalabs.dev').replace(/\/$/, '');
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const pages = import.meta.glob('/src/pages/**/*.astro', { eager: false });

function lastmod(file: string): string {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, { cwd: fileURLToPath(new URL('../../', import.meta.url)) }).toString().trim();
    if (out) return out.slice(0, 10);
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

const entries = Object.keys(pages)
  .map((f) => f.replace(/^\/src\/pages/, '').replace(/\.astro$/, '').replace(/\/index$/, '') || '/')
  .filter((p) => !p.startsWith('/404') && !p.includes('['))
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)))
  .map((p) => {
    const file = `src/pages${p === '/' ? '/index' : p}.astro`;
    const alt = `src/pages${p}/index.astro`;
    let mod = lastmod(file);
    if (mod === new Date().toISOString().slice(0, 10)) mod = lastmod(alt);
    const prio = p === '/' ? '1.0' : /^\/(atlassian|azure)$/.test(p) ? '0.9' : p.startsWith('/atlassian/') ? '0.8' : p.startsWith('/blog/') ? '0.6' : '0.5';
    return `  <url><loc>${origin}${base}${p === '/' ? '/' : p}</loc><lastmod>${mod}</lastmod><priority>${prio}</priority></url>`;
  });

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

export const GET: APIRoute = () =>
  new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
