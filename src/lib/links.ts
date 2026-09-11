// Outbound-link helpers. Two layers, deliberately separate:
//  * withUtm() stamps utm_* on the URL so GA4 (and anyone reading the
//    referrer on the far side) can attribute the visit to this site, this
//    app, and this placement.
//  * track() returns data-* attributes; Base.astro's click listener turns
//    them into a GA4 `marketplace_click` event with app/marketplace/placement
//    params, which is what makes the Reports > Events view useful.
// Register app, marketplace, and placement as custom dimensions in GA4 once.

export type Marketplace = 'atlassian' | 'azure' | 'aws';

export function withUtm(url: string, campaign: string, content: string): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', 'katabarwalabs.dev');
  u.searchParams.set('utm_medium', 'referral');
  u.searchParams.set('utm_campaign', campaign);
  u.searchParams.set('utm_content', content);
  return u.toString();
}

export function track(marketplace: Marketplace, app: string, placement: string) {
  return {
    'data-track': 'marketplace_click',
    'data-marketplace': marketplace,
    'data-app': app,
    'data-placement': placement,
  };
}
