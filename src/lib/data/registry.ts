import type { QuizDefinition } from '../quiz/definition';
import { monthsToIndonesian, monthsToEnglish } from './months';
import { numbersToWords, wordsToNumbers } from './numbers';

export const QUIZ_REGISTRY: QuizDefinition[] = [
  numbersToWords,
  wordsToNumbers,
  monthsToIndonesian,
  monthsToEnglish,
];

export const QUIZ_BY_SLUG = new Map(QUIZ_REGISTRY.map(q => [q.slug, q]));
