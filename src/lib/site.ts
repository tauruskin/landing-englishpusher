// Where the page counts as published, which HubSpot form it sends to, and whether it shows
// Interim copy. One rule, read by the layout (GTM gate, robots meta), the SEO routes and the form.

/** The only host that loads analytics and sends to the live CRM form (ADR-0001). */
export const LIVE_HOST = "landing.englishpusher.in.ua";

/**
 * Exact string match on `location.hostname` — no suffix, prefix or case folding. Any other host
 * (localhost, a preview, a `www.` alias, the GitHub Pages default) is not published; adding a
 * host means changing LIVE_HOST.
 */
export function isPublished(host: string): boolean {
  return host === LIVE_HOST;
}

export const PORTAL_ID = "149535757";
/** HubSpot "Trial lesson request" — read by the Leads Bot, the deal pipeline and the Monday report. */
export const LIVE_FORM_ID = "2226dfee-47d4-406f-ae1a-2e8c0952dec2";
/** HubSpot Test form with the same fields; no lead handling reads it (AC-13). */
export const TEST_FORM_ID = "b0bbb13b-2b4b-4d5e-b7b6-2d75de3db87b";

export function formIdFor(host: string): string {
  return isPublished(host) ? LIVE_FORM_ID : TEST_FORM_ID;
}

/**
 * The page shows Interim copy: asks not to be indexed and stays out of sitemap.xml (AC-11).
 * The release that replaces the Interim copy flips this one value.
 */
export const INTERIM_COPY: boolean = true;
