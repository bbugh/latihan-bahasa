/** A generated question and its expected answer, with no embedded behavior. */
export interface QuizPrompt {
  prompt: string;
  answer: string;
}

/**
 * Result of checking a user's answer against the expected answer.
 *
 * `wrongSpans` contains character-level `[start, end)` ranges in the user's
 * input that should be visually highlighted as incorrect.
 */
export interface QuizCheckResult {
  correct: boolean;
  errors: string[];
  warnings: string[];
  wrongSpans: [number, number][];
}

/**
 * Declarative definition of a quiz type. Contains all metadata, question
 * generation, answer checking, and hint logic for one quiz. Data files in
 * `data/` export instances of this interface; the store and view consume them
 * without knowing what kind of quiz they are.
 */
export interface QuizDefinition {
  /** URL-safe identifier, e.g. "months-to-indonesian". */
  slug: string;
  /** Display title shown in the quiz list, e.g. "Months → Indonesian". */
  title: string;
  /** Short description shown below the title on the home page. */
  description: string;
  /** Grouping label for the home page, e.g. "Numbers" or "Months". */
  category: string;
  /** Instruction text shown above the prompt during the quiz. */
  instruction: string;
  /** Controls the virtual keyboard type on mobile. */
  inputMode: 'text' | 'numeric';
  placeholder: string;
  /** Generate a new question, optionally avoiding repetition of the previous one. */
  generate: (previous?: QuizPrompt) => QuizPrompt;
  /** Check the user's input against the expected answer. */
  check: (expected: string, input: string) => QuizCheckResult;
  /** Build progressive hint strings for the answer. Omit if the quiz has no hints. */
  buildHints?: (answer: string) => string[];
}
