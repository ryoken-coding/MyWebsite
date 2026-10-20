// @ts-check
import { defineConfig } from 'astro/config';

// SEO URLs are emitted only after the real public origin is configured.
// Never publish a made-up canonical address or sitemap hostname.
const site = process.env.PUBLIC_SITE_URL?.trim().replace(/\/+$/, '') || undefined;

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
