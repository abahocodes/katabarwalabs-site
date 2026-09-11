// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync } from 'node:fs';

// Static site for Katabarwa Labs. `site` is the production origin (custom domain
// on Route 53). Output is a fully static `dist/` — deployable to S3+CloudFront,
// GitHub Pages, or any static host.
// `base` is set for the interim GitHub Pages project URL
// (abahocodes.github.io/katabarwalabs-site/). When the katabarwalabs.com custom
// domain is attached, change base to '/' and add public/CNAME — links are
// base-aware (import.meta.env.BASE_URL), so nothing else needs to change.
// `base` is env-driven so the same source serves two targets:
//  • default (GitHub Pages preview) → '/katabarwalabs-site'
//  • AWS/CloudFront at the custom domain → build with SITE_BASE=/ (root)
// Links are base-aware (import.meta.env.BASE_URL), so nothing else changes.
export default defineConfig({
  site: 'https://katabarwalabs.dev',
  // The Atlassian catalogue moved from /apps to /atlassian (platform-first IA,
  // matching /azure). CloudFront answers these with real 301s in production
  // (aws/cloudfront-site.yaml); these static redirect pages cover the GitHub
  // Pages preview and any host without the function.
  redirects: {
    '/apps': '/atlassian',
    // Static output cannot expand a wildcard, so enumerate the app slugs. The
    // screenshot folders under public/apps are one per app, so this stays in
    // sync without a second list.
    ...Object.fromEntries(
      readdirSync('public/apps', { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => [`/apps/${d.name}`, `/atlassian/${d.name}`]),
    ),
  },
  base: process.env.SITE_BASE ?? '/katabarwalabs-site',
  vite: {
    plugins: [tailwindcss()],
  },
});
