import type { APIRoute } from 'astro';

// Dependency-free sitemap. Uses the configured `site` origin and the build-time
// base (root '/' for the AWS/CloudFront prod build, '/katabarwalabs-site' on the
// GitHub Pages preview), so the emitted URLs are correct for whichever target
// this was built for.
const origin = (import.meta.env.SITE ?? 'https://katabarwalabs.dev').replace(/\/$/, '');
const base = import.meta.env.BASE_URL.replace(/\/$/, ''); // '' at root, '/katabarwalabs-site' on Pages

const paths = [
  '/',
  '/blog',
  '/blog/azure-spending-limit-hard-cap',
  '/blog/set-an-entra-id-account-to-expire',
  '/blog/find-and-delete-orphaned-azure-resources',
  '/blog/who-created-an-azure-resource-createdby-tag',
  '/blog/just-in-time-azure-role-elevation-without-pim',
  '/support',
  '/privacy',
];

const lastmod = '2026-08-26';

const urls = paths
  .map((p) => {
    const loc = `${origin}${base}${p === '/' ? '/' : p}`;
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

export const GET: APIRoute = () =>
  new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
