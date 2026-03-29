import { hydratable } from 'svelte';
import type { QuizSession, ActiveQuestion } from '../quiz/session';
import type { QuizCheckResult } from '../quiz/definition';

/**
 * Generate a value that stays stable across SSR and hydration. Falls back
 * to calling `fn()` directly in vitest, which doesn't compile .svelte.ts
 * files with the experimental async flag that hydratable requires.
 */
function stableValue<T>(key: string, fn: () => T): T {
  try {
    return hydratable(key, fn);
  } catch {
    return fn();
  }
}

/**
 * Create a reactive quiz session from a {@link QuizSession}. Manages the
 * current question, user input, check results, and hint progression using
 * Svelte 5 runes. Per-question properties (inputMode, instruction, etc.)
 * update automatically when the session produces a new question.
 */
export function createQuizState(session: QuizSession) {
  let active: ActiveQuestion = $state(
    stableValue(session.slug, () => session.generate())
  );
  let hints: string[] = $state(active.buildHints?.(active.prompt.answer) ?? []);
  let input: string = $state('');
  let result: QuizCheckResult | null = $state(null);
  let hintIndex: number = $state(0);

  return {
    get prompt() { return active.prompt.prompt; },
    get answer() { return active.prompt.answer; },
    get inputMode() { return active.context.inputMode; },
    get placeholder() { return active.context.placeholder; },
    get instruction() { return active.context.instruction; },

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

    get currentHint() { return hintIndex > 0 ? hints[hintIndex - 1] : null; },
    get hasHints() { return hints.length > 0; },
    get canHint() { return !result?.correct && hintIndex < hints.length; },
    get canSubmit() { return !result?.correct && !!input.trim(); },

    submit() {
      result = active.check(active.prompt.answer, input);
    },

    next() {
      active = session.generate(active);
      hints = active.buildHints?.(active.prompt.answer) ?? [];
      input = '';
      result = null;
      hintIndex = 0;
    },

    showHint() {
      if (hintIndex < hints.length) {
        hintIndex++;
      }
    },
  };
}
