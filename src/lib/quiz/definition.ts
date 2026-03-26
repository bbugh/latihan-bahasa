export interface QuizPrompt {
  prompt: string;
  answer: string;
}

export interface QuizCheckResult {
  correct: boolean;
  errors: string[];
  warnings: string[];
  wrongSpans: [number, number][]; // [start, end) character indices in input
}

export interface QuizDefinition {
  slug: string;
  title: string;
  description: string;
  category: string;
  instruction: string;
  promptStyle: 'number' | 'text';
  inputMode: 'text' | 'numeric';
  placeholder: string;
  generate: (previous?: QuizPrompt) => QuizPrompt;
  check: (expected: string, input: string) => QuizCheckResult;
  buildHints?: (answer: string) => string[];
}
