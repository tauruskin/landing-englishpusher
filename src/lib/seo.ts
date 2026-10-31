// What search engines read, driven by the one interim setting (AC-11): the page can always be
// crawled, but while it shows Interim copy it asks not to be indexed and the sitemap is empty.
import { INTERIM_COPY } from "./site.ts";

const trimSlash = (siteUrl: string) => siteUrl.replace(/\/+$/, "");

export function robotsMeta(interim: boolean = INTERIM_COPY): string {
  return interim ? "noindex, follow" : "index, follow";
}

/** Always allows crawling — a Disallow would hide the noindex tag from crawlers. */
export function robotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${trimSlash(siteUrl)}/sitemap.xml\n`;
}

export function sitemapXml(siteUrl: string, interim: boolean = INTERIM_COPY): string {
  const urls = interim ? "" : `  <url><loc>${trimSlash(siteUrl)}/</loc></url>\n`;
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls +
    "</urlset>\n"
  );
}
