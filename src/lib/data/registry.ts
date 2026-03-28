import type { QuizDefinition } from '../quiz/definition';
import { COLORS } from './colors';
import { daysToIndonesian, daysToEnglish } from './days';
import { monthsToIndonesian, monthsToEnglish } from './months';
import { numbersToWords, wordsToNumbers } from './numbers';

/** All available quizzes. Add new quiz definitions here to make them appear in the app. */
export const QUIZ_REGISTRY: QuizDefinition[] = [
  numbersToWords,
  wordsToNumbers,
  monthsToIndonesian,
  monthsToEnglish,
  daysToIndonesian,
  daysToEnglish,
  COLORS.quiz('en', 'id'),
  COLORS.quiz('id', 'en'),
];

/** Lookup map for finding a quiz definition by its URL slug. */
export const QUIZ_BY_SLUG = new Map(QUIZ_REGISTRY.map(q => [q.slug, q]));
