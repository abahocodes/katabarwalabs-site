// Canonical URLs and JSON-LD builders. Every builder returns a plain object;
// Base.astro serialises the array it is given into one <script type=ld+json>.
// All absolute URLs use the production origin regardless of the build target,
// so the GitHub Pages preview still declares katabarwalabs.dev as canonical.

export const ORIGIN = 'https://katabarwalabs.dev';
export const ORG_NAME = 'Katabarwa Labs';
export const SUPPORT_EMAIL = 'support@llmgraph.ai';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Site-relative path (with the build base) -> canonical absolute production URL. */
export function canonical(pathname: string): string {
  let p = pathname;
  if (base && p.startsWith(base)) p = p.slice(base.length) || '/';
  if (p !== '/' && p.endsWith('/')) p = p.slice(0, -1);
  return ORIGIN + p;
}

/** Absolute URL for a file under public/ (site-relative, no base). */
export const asset = (path: string) => ORIGIN + (path.startsWith('/') ? path : '/' + path);

export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORIGIN + '/#organization',
    name: ORG_NAME,
    legalName: 'Katabarwa Labs Inc',
    url: ORIGIN + '/',
    logo: { '@type': 'ImageObject', url: asset('/logo-512.png'), width: 512, height: 512 },
    email: SUPPORT_EMAIL,
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: SUPPORT_EMAIL, availableLanguage: 'English' }],
    sameAs: [
      'https://marketplace.atlassian.com/vendors/524654952',
      'https://github.com/abahocodes',
    ],
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': ORIGIN + '/#website',
    url: ORIGIN + '/',
    name: ORG_NAME,
    publisher: { '@id': ORIGIN + '/#organization' },
    inLanguage: 'en',
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: canonical(it.path),
    })),
  };
}

export function collection(opts: { path: string; name: string; description: string; items: { name: string; url: string }[] }) {
  return [
    {
      '@type': 'CollectionPage',
      '@id': canonical(opts.path) + '#page',
      url: canonical(opts.path),
      name: opts.name,
      description: opts.description,
      isPartOf: { '@id': ORIGIN + '/#website' },
      about: { '@id': ORIGIN + '/#organization' },
    },
    {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
    },
  ];
}

export function softwareApp(opts: {
  path: string; name: string; description: string; product: string;
  listing: string; docs: string; screenshots: string[]; readOnly: boolean;
}) {
  return {
    '@type': 'SoftwareApplication',
    '@id': canonical(opts.path) + '#app',
    name: opts.name,
    url: canonical(opts.path),
    description: opts.description,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: `${opts.product} Cloud administration`,
    operatingSystem: 'Atlassian Cloud (Forge)',
    softwareRequirements: `${opts.product} Cloud`,
    installUrl: opts.listing,
    sameAs: [opts.listing],
    softwareHelp: { '@type': 'CreativeWork', url: opts.docs },
    screenshot: opts.screenshots.map((u) => ({ '@type': 'ImageObject', url: u })),
    // Forge apps are free for sites with up to 10 users and carry a free
    // evaluation above that; paid tiers are per user and set on the listing.
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      priceCurrency: 'USD',
      offerCount: 1,
      availability: 'https://schema.org/InStock',
      url: opts.listing,
      description: 'Free for up to 10 users and free to evaluate; paid per user through the Atlassian Marketplace above that.',
    },
    author: { '@id': ORIGIN + '/#organization' },
    publisher: { '@id': ORIGIN + '/#organization' },
    featureList: opts.readOnly ? 'Read-only reporting and CSV export' : 'Reporting, CSV export, and one opt-in write path',
    isAccessibleForFree: false,
  };
}

export function blogPosting(opts: { path: string; title: string; description: string; isoDate: string; image?: string; tag?: string }) {
  return {
    '@type': 'BlogPosting',
    '@id': canonical(opts.path) + '#article',
    mainEntityOfPage: canonical(opts.path),
    url: canonical(opts.path),
    headline: opts.title,
    description: opts.description,
    datePublished: opts.isoDate,
    dateModified: opts.isoDate,
    inLanguage: 'en',
    articleSection: opts.tag,
    image: opts.image ? [opts.image] : undefined,
    author: { '@id': ORIGIN + '/#organization' },
    publisher: { '@id': ORIGIN + '/#organization' },
    isPartOf: { '@id': ORIGIN + '/#website' },
  };
}

/** "September 2, 2026" -> "2026-09-02". Throws on a date it cannot read so a typo fails the build. */
export function isoDate(human: string): string {
  const d = new Date(human + ' UTC');
  if (Number.isNaN(d.getTime())) throw new Error(`Unparseable pubDate: ${human}`);
  return d.toISOString().slice(0, 10);
}
