import { hydratable } from 'svelte';
import type { QuizDefinition, QuizCheckResult, QuizPrompt } from '../quiz/definition';

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
 * Create a reactive quiz session from a {@link QuizDefinition}. Manages the
 * current prompt, user input, check results, and hint progression using
 * Svelte 5 runes. The returned object exposes getters for the view to bind
 * to and methods (`submit`, `next`, `showHint`) for user actions.
 */
export function createQuizState(definition: QuizDefinition) {
  let prompt: QuizPrompt = $state(stableValue(definition.slug, () => definition.generate()));
  let hints: string[] = $state(definition.buildHints?.(prompt.answer) ?? []);
  let input: string = $state('');
  let result: QuizCheckResult | null = $state(null);
  let hintIndex: number = $state(0);

  return {
    get prompt() { return prompt.prompt; },
    get answer() { return prompt.answer; },
    get promptStyle() { return definition.promptStyle; },
    get inputMode() { return definition.inputMode; },
    get placeholder() { return definition.placeholder; },

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
      result = definition.check(prompt.answer, input);
    },

    next() {
      prompt = definition.generate(prompt);
      hints = definition.buildHints?.(prompt.answer) ?? [];
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
