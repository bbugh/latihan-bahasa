import { editDistance } from './edit-distance';

export interface VocabularyItem {
  prompt: string;
  answer: string;
  firstSound?: string;
}

export interface VocabularySet {
  items: VocabularyItem[];
}

export interface VocabularyCheckResult {
  correct: boolean;
  errors: string[];
}

export function checkVocabularyAnswer(expected: string, input: string): VocabularyCheckResult {
  const trimmed = input.trim();
  if (!trimmed) return { correct: false, errors: ['No answer given'] };

  if (trimmed.toLowerCase() === expected.toLowerCase()) {
    return { correct: true, errors: [] };
  }

  const dist = editDistance(trimmed.toLowerCase(), expected.toLowerCase());
  if (dist <= Math.ceil(expected.length / 3)) {
    return { correct: false, errors: ['Almost! Check the highlighted word(s)'] };
  }

  return { correct: false, errors: ['Incorrect'] };
}

export function randomPracticeItem(set: VocabularySet, previous?: VocabularyItem): VocabularyItem {
  if (set.items.length <= 1) return set.items[0];

  let item: VocabularyItem;
  do {
    item = set.items[Math.floor(Math.random() * set.items.length)];
  } while (previous && item.prompt === previous.prompt && item.answer === previous.answer);

  return item;
}
