import type { QuizCheckResult, QuizDefinition, QuizPrompt } from './definition';
import { editDistance } from './edit-distance';
import { buildHints } from './hints';
import { wordErrorHighlightRanges } from './highlights';

export interface VocabItem {
  english: string;
  indonesian: string;
  firstSound?: string;
}

interface VocabQuizPairConfig {
  category: string;
  items: VocabItem[];
  fromLabel: string;
  toLabel: string;
}

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
    check: vocabCheck,
    buildHints(answer: string): string[] {
      return buildHints(answer);
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
    check: vocabCheck,
    buildHints(answer: string): string[] {
      return buildHints(answer);
    },
  };

  return [forward, reverse];
}

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
    wrongSpans: wordErrorHighlightRanges(trimmed, wrongIndices),
  };
}

export function randomItem<T>(
  items: T[],
  previous: QuizPrompt | undefined,
  getPrompt: (item: T) => string,
): T {
  if (items.length <= 1) return items[0];

  let item: T;
  do {
    item = items[Math.floor(Math.random() * items.length)];
  } while (previous && getPrompt(item) === previous.prompt);

  return item;
}
