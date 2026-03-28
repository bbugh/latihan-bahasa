import type { QuizDefinition } from '../quiz/definition';
import { DAYS } from './days';
import { MONTHS } from './months';
import { numbersToWords, wordsToNumbers } from './numbers';

/** All available quizzes. Add new quiz definitions here to make them appear in the app. */
export const QUIZ_REGISTRY: QuizDefinition[] = [
  numbersToWords,
  wordsToNumbers,
  MONTHS.quiz('en', 'id'),
  MONTHS.quiz('id', 'en'),
  DAYS.quiz('en', 'id'),
  DAYS.quiz('id', 'en'),
];

/** Lookup map for finding a quiz definition by its URL slug. */
export const QUIZ_BY_SLUG = new Map(QUIZ_REGISTRY.map(q => [q.slug, q]));
