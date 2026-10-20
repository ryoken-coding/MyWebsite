import type { LocaleKey } from './pt-PT';
import ptPT from './pt-PT';
import ptBR from './pt-BR';
import en from './en';
import es from './es';
import fr from './fr';
import zhCN from './zh-CN';
import zhTW from './zh-TW';
import ru from './ru';
import uk from './uk';
import it from './it';
import de from './de';
import pl from './pl';
import hi from './hi';
import ko from './ko';
import ja from './ja';
import ar from './ar';
import bg from './bg';
import nl from './nl';
import sv from './sv';
import el from './el';
import ro from './ro';

export type { LocaleKey };
export type Dictionary = Record<LocaleKey, string>;

/** All dictionaries, keyed by URL code. */
const dictionaries: Record<string, Dictionary> = {
  pt: ptPT,
  'pt-br': ptBR,
  en,
  es,
  fr,
  'zh-cn': zhCN,
  'zh-tw': zhTW,
  ru,
  uk,
  it,
  de,
  pl,
  hi,
  ko,
  ja,
  ar,
  bg,
  nl,
  sv,
  el,
  ro,
};

/** Return only a known locale; invalid codes must never fall back silently. */
export const getDictionary = (locale: string): Dictionary => {
  if (!Object.prototype.hasOwnProperty.call(dictionaries, locale)) {
    throw new RangeError(`Unsupported locale: ${locale}`);
  }
  const dictionary = dictionaries[locale];
  return dictionary;
};

/** Strict lookup for templates, including computed project keys. */
export const createTranslator = (locale: string) => {
  const dictionary = getDictionary(locale);
  return (key: string): string => {
    const value = dictionary[key as LocaleKey];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Missing translation for locale "${locale}", key "${key}"`);
    }
    return value;
  };
};

/** Path helper that keeps the same route across languages. */
export const localePath = (locale: string, path = ''): string => {
  if (!Object.prototype.hasOwnProperty.call(dictionaries, locale)) {
    throw new RangeError(`Unsupported locale: ${locale}`);
  }
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${locale}/${clean}/` : `/${locale}/`;
};

export const projectPath = (locale: string, slug: string) => localePath(locale, `projects/${slug}`);
