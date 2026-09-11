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

## 3. Continuous deployment from GitHub (since 2026-09-11)

Every push to `main` of `github.com/abahocodes/katabarwalabs-site` runs
`.github/workflows/deploy.yml`: `npm ci` → `astro build` with `SITE_BASE=/` → `aws s3 sync --delete`
to `katabarwalabs-site-520829456724` → CloudFront invalidation of `E3AZBNPWGP4PH1` → smoke test of
`/` and `/sitemap.xml`. Auth is GitHub OIDC assuming IAM role `katabarwalabs-site-deploy`
(trust: the repo has GitHub's immutable OIDC subject on, so the `sub` claim is
`repo:abahocodes@7064538/katabarwalabs-site@1327457696:environment:production` and the trust
policy matches that prefix for the `production` environment and `ref:refs/heads/main`; permissions:
list/put/delete on that bucket, `cloudfront:CreateInvalidation` on that distribution, nothing else). No AWS keys in
GitHub. The workflow only ships content; stack, certificate and DNS changes still go through
`./aws/deploy.sh` from a workstation. The old GitHub Pages deployment was deleted the same day so
`abahocodes.github.io/katabarwalabs-site` no longer serves a duplicate of the site.

To ship: commit to `main` and push. Watch with `gh run watch` or the Actions tab; the production
environment URL on the run is https://katabarwalabs.dev/.

### Search engines after each deploy (`tools/seo-notify.py`)

The last workflow step tells search engines what changed:

- **IndexNow** (Bing, Yandex, DuckDuckGo, Naver): the key is the 32-hex `public/<key>.txt` file;
  the step posts the URLs whose page source changed in the push (all sitemap URLs on a
  `workflow_dispatch` run or when layouts/data/lib changed). No secret.
- **Google Search Console**: resubmits `/sitemap.xml` and runs URL Inspection on the changed URLs,
  printing verdict, coverage state and last crawl in the run summary. Auth is keyless (the GCP org
  policy forbids service-account keys): `google-github-actions/auth` exchanges the GitHub OIDC
  token at workload identity pool `github`, provider `katabarwalabs-site` (project
  `katabarwa-marketplace`, 988890029470, condition `assertion.repository ==
  'abahocodes/katabarwalabs-site'`) for an access token of service account
  `gsc-ci@katabarwa-marketplace.iam.gserviceaccount.com`, which must be a **Full** user on the
  `sc-domain:katabarwalabs.dev` property (Search Console → Settings → Users and permissions). If the
  auth step fails the deploy still passes; the notify step logs the reason. Google's sitemap ping endpoint is gone (2023) and the
  Indexing API is not allowed for ordinary pages, so sitemap + inspection is the whole automatable
  surface; a fresh page still gets indexed on Google's own schedule.

## 4. Analytics and SEO conventions (added 2026-09-10)

**Information architecture.** Platform-first, the way multi-platform Marketplace vendors do it:
`/atlassian` (hub) → `/atlassian/<slug>` (product), `/azure` (hub) → `/azure/<slug>` (product), `/blog`,
`/security` (trust page), `/support`, `/privacy`. The footer is the sitemap. The old `/apps/*`
routes 301 to `/atlassian/*` in the CloudFront function and via static redirect pages in
`astro.config.mjs` (enumerated from `public/apps/*`, which stays the screenshot folder).

**Outbound link tagging** (`src/lib/links.ts`). Every Marketplace and docs link gets two things:
- `withUtm(url, campaign, content)`: `utm_source=katabarwalabs.dev`, `utm_medium=referral`,
  `utm_campaign=<marketplace listing slug>`, `utm_content=<placement>`. The campaign is the
  Marketplace slug (e.g. `compliance-log-vault`), never the site slug, so an app is one id
  everywhere. Placements in use: `app-page-hero`, `app-page-docs`, `app-page-footer`,
  `azure-page-hero`, `azure-page-footer`, `blog-post`. Hub and homepage cards link to product pages,
  so every Marketplace click passes through a page that explains the product first.
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
on app pages, `BlogPosting` on posts, `CollectionPage` + `ItemList` on the two hubs. `src/data/azureAppDetails.ts` holds the Azure product records; `price` is null until
confirmed from Partner Center, and the JSON-LD `Offer` carries the number only when it is set. `og:image`
defaults to `public/og/default.png` (1200×630) and is the first screenshot on app pages.
`public/logo-512.png` is the Organization logo. Both PNGs were rendered from HTML in a browser; the
source card lives in git history (commit that added `public/og`). `sitemap.xml` is generated from
the pages on disk with `lastmod` from git, so nothing needs listing by hand.

**Copy rule**: no em or en dashes in user-facing strings. Titles use `|` as the separator.

## 5. The Atlassian link layer (added 2026-09-10)

Modelled on the vendors that rank (Tempo, SaaSJet, Deviniti, Exalate): every product page and
every Atlassian post links out to Atlassian properties wherever a reader would genuinely follow
the link. All of it is driven from `src/data/atlassianApps.ts`; nothing is hand-maintained in
templates.

- `origin`: the public JAC ticket the app answers, with its title and vote count. Rendered as
  "Why it exists" on the product page and in the post's References block.
- `community`: our App Central article, once live. Rendered as a cross-link in both places. The
  Partner Rules of Engagement forbid the reverse direction (articles may link only to the
  Marketplace), so this is the only way the two pages get associated.
- `atlassianDocs`: support.atlassian.com pages for the native feature involved. Verify each URL
  returns 200 before adding it; Atlassian moves support pages often (12 of 25 candidates were
  dead when this was built).
- Trust marks on every Atlassian product page link to Atlassian's own program pages (Runs on
  Atlassian, Forge, the vendor page on the Marketplace, the app approval security workflow),
  the way SaaSJet links Cloud Fortified and its partner tier. Text lozenges, not badge images:
  the official badge files live in the Partner Portal and must not be modified, so use them
  only as downloaded, if at all.
- `FAQPage` JSON-LD on all 27 product pages, mirroring the on-page FAQ verbatim. Tempo has FAQs
  with no schema; this is a gap we take.

Product naming follows Atlassian's brand guidelines: the Atlassian product name comes after a
preposition ("Attachment Cleanup for Confluence", never "Confluence Attachment Cleanup"), no
"Atlassian" in the domain, title case for product names.

**Listing backlinks.** Each public Atlassian listing's "Support ticketing system" link points at
`/atlassian/<slug>#support` (the product page's FAQ section carries `id="support"`), and "Track work
items" points at the docs repo issues. That is the sanctioned chain from Atlassian properties to
this site: Community article → listing → product page. Keep the `#support` anchor when editing
`AppPage.astro`. Every post is bylined with a link to the author's Community profile and carries a
`Person` author node; comparison posts follow the "X apps compared" pattern with data from the
public Marketplace API and a vendor disclosure in the first sentence.
