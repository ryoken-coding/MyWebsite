import type { APIRoute } from 'astro';
import { locales } from '../i18n/locales';
import { projects } from '../data/projects';
import { siteUrl } from '../data/site';

/** Every public page is listed once a real public origin has been configured. */
export const GET: APIRoute = () => {
  const routes = ['', 'privacy', ...projects.map((project) => `projects/${project.slug}`)];
  const urls = siteUrl
    ? locales.flatMap((locale) =>
        routes.map((route) => `${siteUrl}/${locale.code}/${route ? `${route}/` : ''}`)
      )
    : [];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
