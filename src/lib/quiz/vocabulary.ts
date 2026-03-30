import type { QuizCheckResult, QuizDefinition, QuizPrompt } from './definition';
import { editDistance } from './edit-distance';
import { buildHints } from './hints';
import { wordErrorHighlightRanges } from './highlights';


/**
 * Check against the primary answer and any additional accepted spellings.
 * Tries exact match against all accepted spellings first, then runs the
 * fuzzy "Almost!" check against the closest accepted spelling.
 */
function vocabCheckWithAlternates(expected: string, input: string, accepted?: string[]): QuizCheckResult {
  if (!accepted || accepted.length === 0) {
    return vocabCheck(expected, input);
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { correct: false, errors: ['No answer given'], warnings: [], wrongSpans: [] };
  }

  // Exact match against any accepted spelling
  for (const spelling of accepted) {
    if (trimmed.toLowerCase() === spelling.toLowerCase()) {
      return { correct: true, errors: [], warnings: [], wrongSpans: [] };
    }
  }

  // Fuzzy check against the closest accepted spelling
  let bestResult = vocabCheck(expected, input);
  for (const spelling of accepted) {
    const result = vocabCheck(spelling, input);
    // Prefer "Almost!" over "Incorrect"
    if (!bestResult.errors.some(e => /almost/i.test(e)) && result.errors.some(e => /almost/i.test(e))) {
      bestResult = result;
    }
  }
  return bestResult;
}

/**
 * Check a vocabulary answer with case-insensitive, whitespace-tolerant matching.
 * Returns "Almost!" feedback when the answer is within one-third edit distance
 * of the expected answer, without revealing the correct answer. Identifies
 * which words in the input are wrong and returns highlight ranges for them.
 */
export function vocabCheck(expected: string, input: string): QuizCheckResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { correct: false, errors: ['No answer given'], warnings: [], wrongSpans: [] };
  }

  if (trimmed.toLowerCase() === expected.toLowerCase()) {
    return { correct: true, errors: [], warnings: [], wrongSpans: [] };
  }

  const dist = editDistance(trimmed.toLowerCase(), expected.toLowerCase());
  const isClose = dist <= Math.ceil(expected.length / 3);
  const errors = isClose
    ? ['Almost! Check the highlighted word(s)']
    : ['Incorrect'];

  const expectedWords = expected.toLowerCase().split(/\s+/);
  const inputWords = trimmed.toLowerCase().split(/\s+/);
  const wrongIndices: number[] = [];
  const maxLen = Math.max(expectedWords.length, inputWords.length);
  for (let i = 0; i < maxLen; i++) {
    if (i >= inputWords.length) break;
    if (i >= expectedWords.length || inputWords[i] !== expectedWords[i]) {
      wrongIndices.push(i);
    }
  }

  return {
    correct: false,
    errors,
    warnings: [],
    wrongSpans: wordErrorHighlightRanges(input, wrongIndices),
  };
}

// -- defineVocabSet: locale-aware vocabulary sets --

/**
 * A vocabulary item keyed by locale code. Each key (e.g. 'en', 'id', 'en-US')
 * maps to an array of accepted spellings. The first spelling is used for display.
 */
export interface VocabSetItem {
  [locale: string]: string[] | string | undefined;
  /**
   * Multi-character opening sound for hint generation (e.g. "Ng" for "Ngomong").
   * Only needed when the first sound is a digraph/trigraph.
   */
  firstSound?: string;
}

interface VocabSetConfig {
  category: string;
  items: VocabSetItem[];
}

export interface VocabSet {
  category: string;
  items: VocabSetItem[];
  /** Base languages available across all items (e.g. ['en', 'id']). */
  languages: string[];
  /**
   * Generate a QuizDefinition for a specific language pair. Call once at
   * module level (e.g. in registry.ts), not in render loops.
   */
  quiz: (from: string, to: string) => QuizDefinition;
}

const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });

function langName(code: string): string {
  return displayNames.of(code) ?? code;
}

/**
 * Extract the base language from a locale code (e.g. 'en-US' → 'en').
 */
function baseLang(locale: string): string {
  return locale.split('-')[0];
}

/**
 * Collect all spellings for a language from an item, including locale-specific
 * keys. For example, if the user's language is 'en', this collects from 'en',
 * 'en-US', 'en-GB', etc.
 */
function allSpellings(item: VocabSetItem, lang: string): string[] {
  const spellings: string[] = [];
  for (const [key, value] of Object.entries(item)) {
    if (key === 'firstSound') continue;
    if (!Array.isArray(value)) continue;
    if (key === lang || baseLang(key) === lang) {
      spellings.push(...value);
    }
  }
  return spellings;
}

/**
 * Get the display spelling for a language — first spelling from the most
 * specific matching key, or first from the base language key.
 */
function displaySpelling(item: VocabSetItem, lang: string): string | undefined {
  // Prefer exact match first (e.g. 'en')
  if (Array.isArray(item[lang]) && item[lang].length > 0) {
    return item[lang][0];
  }
  // Fall back to first locale-specific key matching the base language.
  // Uses insertion order of the item's keys, so put the preferred locale first.
  for (const [key, value] of Object.entries(item)) {
    if (key === 'firstSound') continue;
    if (!Array.isArray(value)) continue;
    if (baseLang(key) === lang && value.length > 0) {
      return value[0];
    }
  }
  return undefined;
}

/**
 * Define a locale-aware vocabulary set. Items use locale codes as keys
 * (e.g. `en`, `id`, `en-US`, `en-GB`) mapping to arrays of accepted spellings.
 * The returned object can generate a {@link QuizDefinition} for any supported
 * language pair.
 */
export function defineVocabSet(config: VocabSetConfig): VocabSet {
  const { category, items } = config;

  // Derive available base languages
  const langSet = new Set<string>();
  for (const item of items) {
    for (const key of Object.keys(item)) {
      if (key === 'firstSound') continue;
      if (!Array.isArray(item[key])) continue;
      langSet.add(baseLang(key));
    }
  }
  const languages = [...langSet].sort();

  function quiz(from: string, to: string): QuizDefinition {
    if (!languages.includes(from) || !languages.includes(to)) {
      throw new Error(`Unsupported language pair: ${from} → ${to}. Available: ${languages.join(', ')}`);
    }

    const categoryLower = category.toLowerCase();

    // Filter to items that have both languages
    const eligible = items.filter(item =>
      allSpellings(item, from).length > 0 && allSpellings(item, to).length > 0
    );

    return {
      slug: `${categoryLower}-to-${langName(to).toLowerCase()}`,
      title: `${category} \u2192 ${langName(to)}`,
      description: `See ${langName(from)}, type the ${langName(to)}`,
      category,
      instruction: `Type the ${langName(to)} translation`,
      inputMode: 'text',
      placeholder: 'Type your answer...',
      generate(previous?: QuizPrompt): QuizPrompt {
        const item = randomItem(eligible, previous, i => displaySpelling(i, from) ?? '');
        return {
          prompt: displaySpelling(item, from)!,
          answer: displaySpelling(item, to)!,
        };
      },
      check(expected: string, input: string): QuizCheckResult {
        const item = eligible.find(i => allSpellings(i, to).some(s => s === expected));
        const accepted = item ? allSpellings(item, to) : [];
        return vocabCheckWithAlternates(expected, input, accepted);
      },
      buildHints(answer: string): string[] {
        const item = eligible.find(i => allSpellings(i, to).some(s => s === answer));
        const firstSound = typeof item?.firstSound === 'string' ? item.firstSound : undefined;
        return buildHints(answer, firstSound);
      },
    };
  }

  return { category, items, languages, quiz };
}

/**
 * Pick a random item from the list, ensuring it differs from the previously
 * shown item to avoid back-to-back repeats.
 *
 * @param items - The full list to choose from.
 * @param previous - The previous quiz prompt, if any. Used to avoid repeats.
 * @param getPrompt - Extracts the prompt string from an item for comparison
 *   against `previous.prompt`.
 */
export function randomItem<T>(
  items: T[],
  previous: QuizPrompt | undefined,
  getPrompt: (item: T) => string,
): T {
  if (!previous) {
    return items[Math.floor(Math.random() * items.length)];
  }

  const candidates = items.filter(i => getPrompt(i) !== previous.prompt);
  const pool = candidates.length > 0 ? candidates : items;
  return pool[Math.floor(Math.random() * pool.length)];
}
