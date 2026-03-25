import type { QuizConfig, QuizCheckResult, QuizQuestion } from '../quiz';

export function createQuizState(config: QuizConfig) {
  let question: QuizQuestion = $state(config.generate());
  let input: string = $state('');
  let result: QuizCheckResult | null = $state(null);
  let hintIndex: number = $state(0);

  return {
    get question() { return question; },
    get input() { return input; },
    set input(v: string) { input = v; },
    get result() { return result; },

    get isCorrect() { return result?.correct ?? false; },
    get errors() { return result && !result.correct ? result.errors : []; },
    get warnings() { return result?.correct ? result.warnings : []; },
    get wrongSpans(): [number, number][] { return result && !result.correct ? result.wrongSpans : []; },

    get borderStyle(): 'correct' | 'error' | 'default' {
      if (result?.correct) return 'correct';
      if (result) return 'error';
      return 'default';
    },

    get currentHint() { return hintIndex > 0 ? question.hints[hintIndex - 1] : null; },
    get hasHints() { return question.hints.length > 0; },
    get canHint() { return !result?.correct && hintIndex < question.hints.length; },
    get canSubmit() { return !result?.correct && !!input.trim(); },

    submit() {
      result = question.check(input);
    },

    next() {
      question = config.generate(question);
      input = '';
      result = null;
      hintIndex = 0;
    },

    showHint() {
      if (hintIndex < question.hints.length) {
        hintIndex++;
      }
    },
  };
}
