import type { APIRoute } from 'astro';
import { siteUrl } from '../data/site';

export const GET: APIRoute = () => {
  const sitemap = siteUrl ? `\n\nSitemap: ${siteUrl}/sitemap.xml` : '';
  const body = `User-agent: *\nAllow: /${sitemap}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
