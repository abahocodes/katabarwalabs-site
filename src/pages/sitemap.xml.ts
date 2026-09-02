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
  '/blog/azure-anomaly-detector-retirement-cost-spikes',
  '/blog/entra-app-registration-secret-expiry-alerts',
  '/blog/azure-tls-certificate-expiry-alerts',
  '/blog/key-vault-expiring-secrets-digest',
  '/blog/find-dangling-dns-records-azure',
  '/blog/clean-up-stale-azure-rbac-assignments',
  '/blog/detect-azure-custom-role-definition-changes',
  '/blog/azure-storage-account-hygiene',
  '/blog/azure-policy-exemptions-tracking',
  '/blog/find-azure-resources-with-no-alerts',
  '/blog/find-azure-vms-without-backup',
  '/blog/keep-atlassian-audit-logs-beyond-retention',
  '/blog/jira-group-usage-beyond-permission-schemes',
  '/blog/export-jsm-assets-object-schema',
  '/blog/jira-filters-dashboards-deactivated-owners',
  '/blog/confluence-attachment-cleanup-storage',
  '/blog/audit-jsm-portal-customer-access',
  '/support',
  '/privacy',
];

const lastmod = '2026-09-02';

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
