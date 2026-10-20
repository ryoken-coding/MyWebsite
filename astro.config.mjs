// @ts-check
import { defineConfig } from 'astro/config';

// The public address is only used for canonical links, hreflang and the sitemap.
// Set PUBLIC_SITE_URL in Vercel to the deployment address (or a future domain).
// Until then the fallback below is a placeholder, not a real address.
const site = process.env.PUBLIC_SITE_URL || 'https://mywebsite.vercel.app';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // The sandbox preview and Vercel both use their own hostnames.
  vite: {
    server: { allowedHosts: true },
    preview: { allowedHosts: true },
  },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'pt-br', 'en', 'es', 'fr', 'zh-cn', 'zh-tw', 'ru', 'uk', 'it', 'de', 'pl', 'hi', 'ko', 'ja', 'ar', 'bg', 'nl', 'sv', 'el', 'ro'],
    routing: { prefixDefaultLocale: true },
  },
});
