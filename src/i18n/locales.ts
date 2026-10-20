/**
 * The 21 language variants served by the site.
 * `code` is used in URLs (/pt/, /en/, ...), `tag` is the BCP-47 hreflang value.
 * Native names are intentionally not translated.
 */
export interface LocaleMeta {
  code: string;
  tag: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const defaultLocale = 'pt';

export const locales: LocaleMeta[] = [
  { code: 'pt', tag: 'pt-PT', nativeName: 'Português (Portugal)', dir: 'ltr' },
  { code: 'pt-br', tag: 'pt-BR', nativeName: 'Português (Brasil)', dir: 'ltr' },
  { code: 'en', tag: 'en', nativeName: 'English', dir: 'ltr' },
  { code: 'es', tag: 'es', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', tag: 'fr', nativeName: 'Français', dir: 'ltr' },
  { code: 'zh-cn', tag: 'zh-CN', nativeName: '简体中文', dir: 'ltr' },
  { code: 'zh-tw', tag: 'zh-TW', nativeName: '繁體中文', dir: 'ltr' },
  { code: 'ru', tag: 'ru', nativeName: 'Русский', dir: 'ltr' },
  { code: 'uk', tag: 'uk', nativeName: 'Українська', dir: 'ltr' },
  { code: 'it', tag: 'it', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'de', tag: 'de', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'pl', tag: 'pl', nativeName: 'Polski', dir: 'ltr' },
  { code: 'hi', tag: 'hi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'ko', tag: 'ko', nativeName: '한국어', dir: 'ltr' },
  { code: 'ja', tag: 'ja', nativeName: '日本語', dir: 'ltr' },
  { code: 'ar', tag: 'ar', nativeName: 'العربية', dir: 'rtl' },
  { code: 'bg', tag: 'bg', nativeName: 'Български', dir: 'ltr' },
  { code: 'nl', tag: 'nl', nativeName: 'Nederlands', dir: 'ltr' },
  { code: 'sv', tag: 'sv', nativeName: 'Svenska', dir: 'ltr' },
  { code: 'el', tag: 'el', nativeName: 'Ελληνικά', dir: 'ltr' },
  { code: 'ro', tag: 'ro', nativeName: 'Română', dir: 'ltr' },
];

export const localeCodes = locales.map((l) => l.code);
export const getLocaleMeta = (code: string): LocaleMeta => {
  const locale = locales.find((item) => item.code === code);
  if (!locale) throw new RangeError(`Unsupported locale: ${code}`);
  return locale;
};
export const isValidLocale = (code: string) => localeCodes.includes(code);
