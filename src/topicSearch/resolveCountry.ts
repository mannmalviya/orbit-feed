import type { ArticleCountryHint } from './types'

const SOURCE_COUNTRY_MAP: Record<string, string> = {
  'Reuters (mock)': 'United States',
  'BBC (mock)': 'United Kingdom',
  'The Register (mock)': 'United Kingdom',
  'Korea Herald (mock)': 'South Korea',
  'BBC News': 'United Kingdom',
  'The Guardian': 'United Kingdom',
  Reuters: 'United States',
  'Associated Press': 'United States',
  CNN: 'United States',
  'The New York Times': 'United States',
  'Washington Post': 'United States',
  'Al Jazeera English': 'Qatar',
}

/** Heuristic hints when `country` is missing on a row (simulates API gaps). */
const TEXT_COUNTRY_RULES: { re: RegExp; country: string }[] = [
  { re: /\bwall street\b|\bnew york\b|\bwashington\b|\bcapitol\b/i, country: 'United States' },
  { re: /\bbeijing\b|\bshanghai\b|\bshenzhen\b/i, country: 'China' },
  { re: /\btokyo\b|\bosaka\b|\bjapan\b/i, country: 'Japan' },
  { re: /\bseoul\b|\bjeju\b|\bkorea\b/i, country: 'South Korea' },
  { re: /\blondon\b|\bbc\b|\buk\b|\bbritain\b|\bbrussels\b/i, country: 'United Kingdom' },
  { re: /\bparis\b|\bfrance\b/i, country: 'France' },
  { re: /\bberlin\b|\bgermany\b/i, country: 'Germany' },
  { re: /\bmoscow\b|\brussia\b/i, country: 'Russia' },
  { re: /\bmexico city\b|\bsão paulo\b|\bbrazil\b|\blatam\b/i, country: 'Latin America' },
  { re: /\bnairobi\b|\bkenya\b|\bafrica\b/i, country: 'Africa' },
  { re: /\bsydney\b|\baustralia\b|\banz\b/i, country: 'Australia' },
  { re: /\bstockholm\b|\bsweden\b|\bnordic\b/i, country: 'Sweden' },
  { re: /\bwarsaw\b|\bpoland\b|\bcee\b/i, country: 'Poland' },
  { re: /\bcairo\b|\begypt\b/i, country: 'Egypt' },
  { re: /\btel aviv\b|\bisrael\b/i, country: 'Israel' },
  { re: /\bmadrid\b|\bspain\b|\biberia\b/i, country: 'Spain' },
  { re: /\bvienna\b|\baustria\b/i, country: 'Austria' },
  { re: /\bsingapore\b/i, country: 'Singapore' },
  { re: /\bmumbai\b|\bdelhi\b|\bindia\b/i, country: 'India' },
  { re: /\bottawa\b|\btoronto\b|\bcanada\b/i, country: 'Canada' },
  { re: /\bbeirut\b|\blebanon\b|\bmena\b|\bkyiv\b|\bukraine\b/i, country: 'Eastern Europe / MENA' },
]

/**
 * Prefer explicit `country`, then source-name table, then title/description
 * regex hints, then a neutral fallback.
 */
export function resolveArticleCountry(hint: ArticleCountryHint): string {
  if (hint.country?.trim()) return hint.country.trim()

  const mapped = SOURCE_COUNTRY_MAP[hint.sourceName]
  if (mapped) return mapped

  const haystack = `${hint.title} ${hint.description} ${hint.sourceName}`
  for (const { re, country } of TEXT_COUNTRY_RULES) {
    if (re.test(haystack)) return country
  }

  return 'International'
}
