import { DEFAULT_LOCALE, ROUTED_LOCALES } from "./locales";

/**
 * Prefixes an internal path with the active locale, for components that
 * render on both the unprefixed English tree and the /[locale] tree and
 * need their links to stay within whichever one the user is currently on.
 * English stays unprefixed, matching its existing URLs. A locale the
 * client-side switcher supports but that has no dedicated URL tree yet
 * (anything outside ROUTED_LOCALES) falls back to the unprefixed path
 * rather than linking to a page that doesn't exist.
 */
export function localePath(locale: string, path: string): string {
  if (locale === DEFAULT_LOCALE || !ROUTED_LOCALES.includes(locale)) return path;
  return `/${locale}${path}`;
}
