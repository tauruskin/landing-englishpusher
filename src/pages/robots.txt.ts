import type { APIRoute } from "astro";
import { robotsTxt } from "../lib/seo.ts";

// Always allows crawling and points to the sitemap (AC-11).
export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt(String(site)), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
