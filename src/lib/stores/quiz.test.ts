import { describe, expect, it } from 'vitest';
import { createQuizState } from './quiz.svelte';
import type { QuizDefinition, QuizCheckResult, QuizPrompt } from '../quiz/definition';

function makeDefinition(overrides: Partial<QuizDefinition> = {}): QuizDefinition {
  let callCount = 0;
  return {
    slug: 'test',
    title: 'Test Quiz',
    description: 'A test quiz',
    category: 'Test',
    instruction: 'Type the answer',
    promptStyle: 'text',
    inputMode: 'text',
    placeholder: 'Type here...',
    generate(previous?: QuizPrompt): QuizPrompt {
      callCount++;
      return { prompt: `Question ${callCount}`, answer: 'correct' };
    },
    check(expected: string, input: string): QuizCheckResult {
      const trimmed = input.trim().toLowerCase();
      if (trimmed === expected.toLowerCase()) {
        return { correct: true, errors: [], warnings: ['Nice!'], wrongSpans: [] };
      }
      return {
        correct: false,
        errors: ['Wrong answer'],
        warnings: [],
        wrongSpans: [[0, trimmed.length]],
      };
    },
    buildHints(answer: string): string[] {
      return ['_ _ _ _ _ _ _', 'c _ _ _ _ _ _', 'c _ _ _ _ _ t'];
    },
    ...overrides,
  };
}

function makeDefinitionNoHints(): QuizDefinition {
  return makeDefinition({
    generate(previous?: QuizPrompt): QuizPrompt {
      return { prompt: '42', answer: 'empat puluh dua' };
    },
    check(expected: string, input: string): QuizCheckResult {
      if (input.trim().toLowerCase() === expected.toLowerCase()) {
        return { correct: true, errors: [], warnings: [], wrongSpans: [] };
      }
      return { correct: false, errors: ['Wrong'], warnings: [], wrongSpans: [[0, input.length]] };
    },
    buildHints(): string[] {
      return [];
    },
  });
}

describe('createQuizState', () => {
  it('initializes with a prompt from the definition', () => {
    const state = createQuizState(makeDefinition());
    expect(state.prompt).toBe('Question 1');
    expect(state.answer).toBe('correct');
  });

  it('starts with empty input', () => {
    const state = createQuizState(makeDefinition());
    expect(state.input).toBe('');
  });

  it('starts with no result', () => {
    const state = createQuizState(makeDefinition());
    expect(state.result).toBeNull();
    expect(state.isCorrect).toBe(false);
  });

  it('exposes definition properties', () => {
    const state = createQuizState(makeDefinition());
    expect(state.promptStyle).toBe('text');
    expect(state.inputMode).toBe('text');
    expect(state.placeholder).toBe('Type here...');
  });
});

describe('submit', () => {
  it('sets isCorrect true for correct answer', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'correct';
    state.submit();
    expect(state.isCorrect).toBe(true);
  });

  it('populates errors for wrong answer', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'wrong';
    state.submit();
    expect(state.isCorrect).toBe(false);
    expect(state.errors).toEqual(['Wrong answer']);
  });

  it('populates wrongSpans for wrong answer', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'wrong';
    state.submit();
    expect(state.wrongSpans).toEqual([[0, 5]]);
  });

  it('returns empty wrongSpans for correct answer', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'correct';
    state.submit();
    expect(state.wrongSpans).toEqual([]);
  });

  it('returns warnings for correct answer', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'correct';
    state.submit();
    expect(state.warnings).toEqual(['Nice!']);
  });

  it('returns empty warnings for wrong answer', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'wrong';
    state.submit();
    expect(state.warnings).toEqual([]);
  });
});

describe('borderStyle', () => {
  it('is default before submission', () => {
    const state = createQuizState(makeDefinition());
    expect(state.borderStyle).toBe('default');
  });

  it('is correct after correct submission', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'correct';
    state.submit();
    expect(state.borderStyle).toBe('correct');
  });

  it('is error after wrong submission', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'wrong';
    state.submit();
    expect(state.borderStyle).toBe('error');
  });
});

describe('next', () => {
  it('cycles to a new question', () => {
    const state = createQuizState(makeDefinition());
    expect(state.prompt).toBe('Question 1');
    state.next();
    expect(state.prompt).toBe('Question 2');
  });

  it('resets input', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'something';
    state.next();
    expect(state.input).toBe('');
  });

  it('resets result', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'wrong';
    state.submit();
    expect(state.isCorrect).toBe(false);
    state.next();
    expect(state.result).toBeNull();
    expect(state.borderStyle).toBe('default');
  });

  it('resets hint index', () => {
    const state = createQuizState(makeDefinition());
    state.showHint();
    expect(state.currentHint).toBeTruthy();
    state.next();
    expect(state.currentHint).toBeNull();
  });
});

describe('hints', () => {
  it('starts with no hint shown', () => {
    const state = createQuizState(makeDefinition());
    expect(state.currentHint).toBeNull();
  });

  it('shows first hint after showHint', () => {
    const state = createQuizState(makeDefinition());
    state.showHint();
    expect(state.currentHint).toBe('_ _ _ _ _ _ _');
  });

  it('progresses through hints', () => {
    const state = createQuizState(makeDefinition());
    state.showHint();
    expect(state.currentHint).toBe('_ _ _ _ _ _ _');
    state.showHint();
    expect(state.currentHint).toBe('c _ _ _ _ _ _');
    state.showHint();
    expect(state.currentHint).toBe('c _ _ _ _ _ t');
  });

  it('stops at last hint', () => {
    const state = createQuizState(makeDefinition());
    state.showHint();
    state.showHint();
    state.showHint();
    state.showHint(); // should not go past 3
    expect(state.currentHint).toBe('c _ _ _ _ _ t');
    expect(state.canHint).toBe(false);
  });

  it('hasHints is true when hints exist', () => {
    const state = createQuizState(makeDefinition());
    expect(state.hasHints).toBe(true);
  });

  it('hasHints is false when no hints', () => {
    const state = createQuizState(makeDefinitionNoHints());
    expect(state.hasHints).toBe(false);
  });
});

describe('canSubmit', () => {
  it('is false with empty input', () => {
    const state = createQuizState(makeDefinition());
    expect(state.canSubmit).toBe(false);
  });

  it('is true with non-empty input', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'something';
    expect(state.canSubmit).toBe(true);
  });

  it('is false after correct answer', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'correct';
    state.submit();
    expect(state.canSubmit).toBe(false);
  });

  it('is false with whitespace-only input', () => {
    const state = createQuizState(makeDefinition());
    state.input = '   ';
    expect(state.canSubmit).toBe(false);
  });
});

describe('canHint', () => {
  it('is true when hints available', () => {
    const state = createQuizState(makeDefinition());
    expect(state.canHint).toBe(true);
  });

  it('is false when no hints', () => {
    const state = createQuizState(makeDefinitionNoHints());
    expect(state.canHint).toBe(false);
  });

  it('is false after correct answer', () => {
    const state = createQuizState(makeDefinition());
    state.input = 'correct';
    state.submit();
    expect(state.canHint).toBe(false);
  });
});
