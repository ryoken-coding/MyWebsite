/**
 * Site-wide settings and contact details.
 *
 * Keep real visitor-facing destinations here. Empty values suppress the
 * associated public link or section instead of rendering a placeholder.
 */

/** Real public origin used for canonical URLs, hreflang and sitemap entries. */
export const siteUrl = (import.meta.env.PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');

export const contact = {
  /** Real email address for direct contact. */
  email: '',
  /** Real public GitHub profile URL. */
  github: '',
  /** Real WhatsApp deep link, if one is to be published. */
  whatsapp: '',
} as const;

export const cv = {
  /** Path to an existing, public CV file under /public. */
  file: '',
} as const;

/**
 * Form integration. Set PUBLIC_FORMSPREE_ENDPOINT only after creating and
 * verifying a real form. Without it, the form and its navigation are omitted.
 */
export const formEndpoint = (import.meta.env.PUBLIC_FORMSPREE_ENDPOINT || '').trim();

/**
 * Analytics remains disabled until the integration and its privacy notice have
 * been reviewed. Deployment-specific references are kept here for maintainers.
 */
export const analytics = {
  enabled: false,
  provider: 'Vercel Web Analytics',
  scriptPath: '/_vercel/insights/script.js',
} as const;

/** Real legal details can be added here when supplied; empty values stay private. */
export const legal = {
  controllerName: '',
  contactEmail: '',
  privacyLastUpdated: '',
} as const;
