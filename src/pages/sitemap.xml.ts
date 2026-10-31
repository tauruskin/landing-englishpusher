import type { APIRoute } from "astro";
import { sitemapXml } from "../lib/seo.ts";

// Empty while INTERIM_COPY is true; lists the page once real copy ships (AC-11).
export const GET: APIRoute = ({ site }) =>
  new Response(sitemapXml(String(site)), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
