export interface QuizCheckResult {
  correct: boolean;
  errors: string[];
  warnings: string[];
  wrongSpans: [number, number][]; // [start, end) character indices in input
}

export interface QuizQuestion {
  prompt: string;
  promptStyle?: 'number' | 'text';
  inputMode?: 'text' | 'numeric';
  placeholder?: string;
  answer: string;
  hints: string[];
  check: (input: string) => QuizCheckResult;
}

export interface QuizConfig {
  slug: string;
  title: string;
  description: string;
  category: string;
  instruction: string;
  generate: (previous?: QuizQuestion) => QuizQuestion;
}
