/**
 * Language utility functions for i18n support
 */

export type Language = "en" | "id";
const INDONESIAN_PATH_PREFIX = /^\/id(?:\/|$)/;

/**
 * Detects the current language from a URL pathname
 * @param pathname - The URL pathname to check
 * @returns The detected language code
 */
export function detectLanguage(pathname: string): Language {
  return INDONESIAN_PATH_PREFIX.test(pathname) ? "id" : "en";
}

/**
 * Generates the alternate language URL for the given pathname
 * @param pathname - The current URL pathname
 * @param currentLang - The current language
 * @returns The alternate language pathname
 */
export function getAlternateLanguagePath(
  pathname: string,
  currentLang: Language
): string {
  if (currentLang === "id") {
    // Remove /id prefix for English
    const englishPath = pathname.replace(/^\/id(?=\/|$)/, "");
    return englishPath || "/";
  }

  // Add /id prefix for Indonesian
  return pathname === "/" ? "/id/" : `/id${pathname}`;
}
