// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// BASE_PATH is set by CI while the page is served from the default GitHub Pages
// URL (https://tauruskin.github.io/landing-englishpusher/). Once a CNAME is
// added, drop it from the workflow and the site is served from "/".
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
