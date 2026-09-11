# Deploying katabarwalabs.dev on AWS

100% AWS: Route 53 (domain + DNS) → ACM (TLS) → S3 (private origin) → CloudFront (CDN).
Account: `520829456724` (default profile). Region for ACM + the stack: **us-east-1**.

## 1. Register the domain (one-time)

Registering the domain also creates the Route 53 hosted zone. Contact details are required by
ICANN. Run once (`contact.json` holds the registrant/admin/tech contact — same for all three):

```bash
aws route53domains register-domain --region us-east-1 \
  --domain-name katabarwalabs.dev \
  --duration-in-years 1 --auto-renew \
  --admin-contact  file://aws/contact.json \
  --registrant-contact file://aws/contact.json \
  --tech-contact   file://aws/contact.json \
  --privacy-protect-admin-contact --privacy-protect-registrant-contact --privacy-protect-tech-contact
# → returns an OperationId; poll until SUCCESSFUL:
aws route53domains get-operation-detail --region us-east-1 --operation-id <OperationId>
```

`aws/contact.json` (git-ignored — contains the postal address):

```json
{
  "ContactType": "COMPANY",
  "OrganizationName": "Katabarwa Labs Inc",
  "FirstName": "Abaho", "LastName": "Katabarwa",
  "Email": "abahomyster@gmail.com",
  "PhoneNumber": "+1.6502857980",
  "AddressLine1": "<street>", "City": "<city>",
  "State": "<ST>", "CountryCode": "US", "ZipCode": "<zip>"
}
```

## 2. Deploy hosting + content

Once the domain shows registered:

```bash
AWS_PROFILE=default ./aws/deploy.sh
```

This finds the hosted zone, requests + DNS-validates the ACM cert (us-east-1), builds the site at
root (`SITE_BASE=/`), deploys `aws/cloudfront-site.yaml` (S3 + CloudFront/OAC + Route 53 alias
records + a URL-rewrite function for Astro's `/privacy` `/support` routes), syncs `dist/` to the
bucket, and invalidates the CDN. Result: **https://katabarwalabs.dev/**.

## 3. Flip the listing URLs

After the domain resolves, repoint the marketplace profiles/LISTINGs from the interim Pages URL to
`https://katabarwalabs.dev/`, `/privacy`, `/support`, and retire the GitHub Pages workflow.

## 4. Analytics and SEO conventions (added 2026-09-10)

**Information architecture.** Platform-first, the way multi-platform Marketplace vendors do it:
`/atlassian` (hub) → `/atlassian/<slug>` (product), `/azure` (hub, cards link out), `/blog`,
`/security` (trust page), `/support`, `/privacy`. The footer is the sitemap. The old `/apps/*`
routes 301 to `/atlassian/*` in the CloudFront function and via static redirect pages in
`astro.config.mjs` (enumerated from `public/apps/*`, which stays the screenshot folder).

**Outbound link tagging** (`src/lib/links.ts`). Every Marketplace and docs link gets two things:
- `withUtm(url, campaign, content)`: `utm_source=katabarwalabs.dev`, `utm_medium=referral`,
  `utm_campaign=<marketplace listing slug>`, `utm_content=<placement>`. The campaign is the
  Marketplace slug (e.g. `compliance-log-vault`), never the site slug, so an app is one id
  everywhere. Placements in use: `app-page-hero`, `app-page-docs`, `app-page-footer`,
  `azure-hub-card`, `home-azure-card`, `blog-post`.
- `track(marketplace, app, placement)`: `data-track` attributes that `Base.astro`'s click
  listener turns into a GA4 event `marketplace_click` with params `marketplace`, `app`,
  `placement`, `link_url`.

**One-time GA4 setup (property G-F6YRQHRQSF)**: Admin → Custom definitions → create event-scoped
custom dimensions for `marketplace`, `app`, and `placement`. Until they exist the event fires but
the params are not reportable. Keep Enhanced measurement on; it still records generic outbound
clicks, and `marketplace_click` sits alongside them.

**SEO** (`src/lib/seo.ts`, `src/layouts/Base.astro`). Every page has a canonical pointing at
`https://katabarwalabs.dev` (even on the Pages preview), full Open Graph and Twitter card tags,
and a JSON-LD graph: `Organization` + `WebSite` sitewide, `BreadcrumbList` + `SoftwareApplication`
on app pages, `BlogPosting` on posts, `CollectionPage` + `ItemList` on the two hubs. `og:image`
defaults to `public/og/default.png` (1200×630) and is the first screenshot on app pages.
`public/logo-512.png` is the Organization logo. Both PNGs were rendered from HTML in a browser; the
source card lives in git history (commit that added `public/og`). `sitemap.xml` is generated from
the pages on disk with `lastmod` from git, so nothing needs listing by hand.

**Copy rule**: no em or en dashes in user-facing strings. Titles use `|` as the separator.
