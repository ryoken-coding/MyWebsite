/**
 * Site-wide settings and contact details.
 *
 * Everything in this file is meant to be edited by hand.
 * Values left empty are rendered as visible placeholders (e.g. [EMAIL]) —
 * links are disabled until a real value is provided.
 */

/** Public address used for canonical URLs, hreflang and the sitemap. */
export const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://mywebsite.vercel.app';

export const contact = {
  /** e.g. 'ola@exemplo.com' */
  email: '',
  /** e.g. 'https://github.com/utilizador' */
  github: '',
  /** e.g. 'https://wa.me/351900000000' (international format, no spaces) */
  whatsapp: '',
} as const;

/** Placeholder labels shown while the matching value above is empty. */
export const contactPlaceholders = {
  email: '[EMAIL]',
  github: '[PERFIL GITHUB]',
  whatsapp: '[LINK OU NÚMERO WHATSAPP]',
} as const;

export const cv = {
  /** Path inside /public, e.g. '/curriculo.pdf'. The PDF may contain the public name;
   *  the site itself never displays it. */
  file: '',
  placeholder: '[FICHEIRO DO CURRÍCULO PDF]',
} as const;

/**
 * Form integration. Create a free form at https://formspree.io, put your email
 * as recipient, then set PUBLIC_FORMSPREE_ENDPOINT in Vercel (or in .env locally).
 * While empty, the form states clearly that sending is not configured.
 */
export const formEndpoint = import.meta.env.PUBLIC_FORMSPREE_ENDPOINT || '';

/**
 * Analytics: Vercel Web Analytics (free on Hobby, cookieless).
 * The script is only injected after the visitor opts in, and only on a deployed
 * (non-localhost) hostname. Set analytics.enabled to false to remove it entirely.
 */
export const analytics = {
  enabled: true,
  provider: 'Vercel Web Analytics',
  scriptPath: '/_vercel/insights/script.js',
} as const;

/** Placeholder dates/labels that still need real data (privacy page). */
export const legal = {
  ownerPlaceholder: '[NOME DO RESPONSÁVEL]',
  emailPlaceholder: '[EMAIL DE CONTACTO]',
  formProviderPlaceholder: '[FORNECEDOR DO FORMULÁRIO]',
  analyticsProviderPlaceholder: '[FORNECEDOR E CONFIGURAÇÃO DE ANALYTICS]',
  retentionPlaceholder: '[PRAZO DE RETENÇÃO]',
  updatedPlaceholder: '[DATA DE ATUALIZAÇÃO]',
  hostPlaceholder: '[ALOJAMENTO / FORNECEDOR]',
} as const;
