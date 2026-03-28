import type { QuizCheckResult, QuizDefinition, QuizPrompt } from './definition';
import { editDistance } from './edit-distance';
import { buildHints } from './hints';
import { wordErrorHighlightRanges } from './highlights';

/** A single vocabulary pair for translation quizzes. */
export interface VocabItem {
  english: string;
  indonesian: string;
  /** Alternate accepted spellings for the English answer (e.g. "Gray" for "Grey"). */
  altEnglish?: string[];
  /** Alternate accepted spellings for the Indonesian answer. */
  altIndonesian?: string[];
  /**
   * Multi-character opening sound for hint generation (e.g. "Ng" for "Ngomong").
   * Only needed when the first sound is a digraph/trigraph that wouldn't be
   * obvious from the first letter alone.
   */
  firstSound?: string;
}

interface VocabQuizPairConfig {
  /** Grouping label and slug prefix, e.g. "Months". */
  category: string;
  items: VocabItem[];
  /** Label for the source language, e.g. "English". */
  fromLabel: string;
  /** Label for the target language, e.g. "Indonesian". */
  toLabel: string;
}

/**
 * Create two complementary {@link QuizDefinition}s from a vocabulary list —
 * one translating from `fromLabel` to `toLabel`, and one in reverse. Metadata
 * (slug, title, description, instruction) is auto-generated from the labels.
 *
 * @returns `[forward, reverse]` tuple of quiz definitions.
 */
export function makeVocabQuizPair(config: VocabQuizPairConfig): [QuizDefinition, QuizDefinition] {
  const { category, items, fromLabel, toLabel } = config;
  const categoryLower = category.toLowerCase();
  const singular = categoryLower.replace(/s$/, '');

  const forward: QuizDefinition = {
    slug: `${categoryLower}-to-${toLabel.toLowerCase()}`,
    title: `${category} \u2192 ${toLabel}`,
    description: `See an ${fromLabel} ${singular}, type the ${toLabel}`,
    category,
    instruction: `Type the ${toLabel} ${singular} name`,
    promptStyle: 'text',
    inputMode: 'text',
    placeholder: 'Type your answer...',
    generate(previous?: QuizPrompt): QuizPrompt {
      const item = randomItem(items, previous, i => i.english);
      return { prompt: item.english, answer: item.indonesian };
    },
    check(expected: string, input: string): QuizCheckResult {
      const item = items.find(i => i.indonesian === expected);
      return vocabCheckWithAlternates(expected, input, item?.altIndonesian);
    },
    buildHints(answer: string): string[] {
      const item = items.find(i => i.indonesian === answer);
      return buildHints(answer, item?.firstSound);
    },
  };

  const reverse: QuizDefinition = {
    slug: `${categoryLower}-to-${fromLabel.toLowerCase()}`,
    title: `${category} \u2192 ${fromLabel}`,
    description: `See an ${toLabel} ${singular}, type the ${fromLabel}`,
    category,
    instruction: `Type the ${fromLabel} ${singular} name`,
    promptStyle: 'text',
    inputMode: 'text',
    placeholder: 'Type your answer...',
    generate(previous?: QuizPrompt): QuizPrompt {
      const item = randomItem(items, previous, i => i.indonesian);
      return { prompt: item.indonesian, answer: item.english };
    },
    check(expected: string, input: string): QuizCheckResult {
      const item = items.find(i => i.english === expected);
      return vocabCheckWithAlternates(expected, input, item?.altEnglish);
    },
    buildHints,
  };

  return [forward, reverse];
}

/**
 * Check against the primary answer and any alternate spellings. If the input
 * matches any alternate exactly, it's correct. Otherwise falls through to
 * the standard check against the primary answer.
 */
function vocabCheckWithAlternates(expected: string, input: string, alternates?: string[]): QuizCheckResult {
  if (alternates) {
    const trimmed = input.trim();
    for (const alt of alternates) {
      if (trimmed.toLowerCase() === alt.toLowerCase()) {
        return { correct: true, errors: [], warnings: [], wrongSpans: [] };
      }
    }
  }
  return vocabCheck(expected, input);
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
