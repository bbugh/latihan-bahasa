import { describe, expect, it } from 'vitest';
import { createQuizState } from './quiz.svelte';
import type { QuizConfig, QuizCheckResult, QuizQuestion } from '../quiz';

function makeConfig(overrides: Partial<QuizConfig> = {}): QuizConfig {
  let callCount = 0;
  return {
    slug: 'test',
    title: 'Test Quiz',
    description: 'A test quiz',
    category: 'Test',
    instruction: 'Type the answer',
    generate(previous?: QuizQuestion): QuizQuestion {
      callCount++;
      return {
        prompt: `Question ${callCount}`,
        answer: 'correct',
        hints: ['_ _ _ _ _ _ _', 'c _ _ _ _ _ _', 'c _ _ _ _ _ t'],
        check(input: string): QuizCheckResult {
          const trimmed = input.trim().toLowerCase();
          if (trimmed === 'correct') {
            return { correct: true, errors: [], warnings: ['Nice!'], wrongSpans: [] };
          }
          return {
            correct: false,
            errors: ['Wrong answer'],
            warnings: [],
            wrongSpans: [[0, trimmed.length]],
          };
        },
      };
    },
    ...overrides,
  };
}

function makeConfigNoHints(): QuizConfig {
  return makeConfig({
    generate(previous?: QuizQuestion): QuizQuestion {
      return {
        prompt: '42',
        answer: 'empat puluh dua',
        hints: [],
        check(input: string): QuizCheckResult {
          if (input.trim().toLowerCase() === 'empat puluh dua') {
            return { correct: true, errors: [], warnings: [], wrongSpans: [] };
          }
          return { correct: false, errors: ['Wrong'], warnings: [], wrongSpans: [[0, input.length]] };
        },
      };
    },
  });
}

describe('createQuizState', () => {
  it('initializes with a question from the config', () => {
    const state = createQuizState(makeConfig());
    expect(state.question.prompt).toBe('Question 1');
    expect(state.question.answer).toBe('correct');
  });

  it('starts with empty input', () => {
    const state = createQuizState(makeConfig());
    expect(state.input).toBe('');
  });

  it('starts with no result', () => {
    const state = createQuizState(makeConfig());
    expect(state.result).toBeNull();
    expect(state.isCorrect).toBe(false);
  });
});

describe('submit', () => {
  it('sets isCorrect true for correct answer', () => {
    const state = createQuizState(makeConfig());
    state.input = 'correct';
    state.submit();
    expect(state.isCorrect).toBe(true);
  });

  it('populates errors for wrong answer', () => {
    const state = createQuizState(makeConfig());
    state.input = 'wrong';
    state.submit();
    expect(state.isCorrect).toBe(false);
    expect(state.errors).toEqual(['Wrong answer']);
  });

  it('populates wrongSpans for wrong answer', () => {
    const state = createQuizState(makeConfig());
    state.input = 'wrong';
    state.submit();
    expect(state.wrongSpans).toEqual([[0, 5]]);
  });

  it('returns empty wrongSpans for correct answer', () => {
    const state = createQuizState(makeConfig());
    state.input = 'correct';
    state.submit();
    expect(state.wrongSpans).toEqual([]);
  });

  it('returns warnings for correct answer', () => {
    const state = createQuizState(makeConfig());
    state.input = 'correct';
    state.submit();
    expect(state.warnings).toEqual(['Nice!']);
  });

  it('returns empty warnings for wrong answer', () => {
    const state = createQuizState(makeConfig());
    state.input = 'wrong';
    state.submit();
    expect(state.warnings).toEqual([]);
  });
});

describe('borderStyle', () => {
  it('is default before submission', () => {
    const state = createQuizState(makeConfig());
    expect(state.borderStyle).toBe('default');
  });

  it('is correct after correct submission', () => {
    const state = createQuizState(makeConfig());
    state.input = 'correct';
    state.submit();
    expect(state.borderStyle).toBe('correct');
  });

  it('is error after wrong submission', () => {
    const state = createQuizState(makeConfig());
    state.input = 'wrong';
    state.submit();
    expect(state.borderStyle).toBe('error');
  });
});

describe('next', () => {
  it('cycles to a new question', () => {
    const state = createQuizState(makeConfig());
    expect(state.question.prompt).toBe('Question 1');
    state.next();
    expect(state.question.prompt).toBe('Question 2');
  });

  it('resets input', () => {
    const state = createQuizState(makeConfig());
    state.input = 'something';
    state.next();
    expect(state.input).toBe('');
  });

  it('resets result', () => {
    const state = createQuizState(makeConfig());
    state.input = 'wrong';
    state.submit();
    expect(state.isCorrect).toBe(false);
    state.next();
    expect(state.result).toBeNull();
    expect(state.borderStyle).toBe('default');
  });

  it('resets hint index', () => {
    const state = createQuizState(makeConfig());
    state.showHint();
    expect(state.currentHint).toBeTruthy();
    state.next();
    expect(state.currentHint).toBeNull();
  });
});

describe('hints', () => {
  it('starts with no hint shown', () => {
    const state = createQuizState(makeConfig());
    expect(state.currentHint).toBeNull();
  });

  it('shows first hint after showHint', () => {
    const state = createQuizState(makeConfig());
    state.showHint();
    expect(state.currentHint).toBe('_ _ _ _ _ _ _');
  });

  it('progresses through hints', () => {
    const state = createQuizState(makeConfig());
    state.showHint();
    expect(state.currentHint).toBe('_ _ _ _ _ _ _');
    state.showHint();
    expect(state.currentHint).toBe('c _ _ _ _ _ _');
    state.showHint();
    expect(state.currentHint).toBe('c _ _ _ _ _ t');
  });

  it('stops at last hint', () => {
    const state = createQuizState(makeConfig());
    state.showHint();
    state.showHint();
    state.showHint();
    state.showHint(); // should not go past 3
    expect(state.currentHint).toBe('c _ _ _ _ _ t');
    expect(state.canHint).toBe(false);
  });

  it('hasHints is true when hints exist', () => {
    const state = createQuizState(makeConfig());
    expect(state.hasHints).toBe(true);
  });

  it('hasHints is false when no hints', () => {
    const state = createQuizState(makeConfigNoHints());
    expect(state.hasHints).toBe(false);
  });
});

describe('canSubmit', () => {
  it('is false with empty input', () => {
    const state = createQuizState(makeConfig());
    expect(state.canSubmit).toBe(false);
  });

  it('is true with non-empty input', () => {
    const state = createQuizState(makeConfig());
    state.input = 'something';
    expect(state.canSubmit).toBe(true);
  });

  it('is false after correct answer', () => {
    const state = createQuizState(makeConfig());
    state.input = 'correct';
    state.submit();
    expect(state.canSubmit).toBe(false);
  });

  it('is false with whitespace-only input', () => {
    const state = createQuizState(makeConfig());
    state.input = '   ';
    expect(state.canSubmit).toBe(false);
  });
});

describe('canHint', () => {
  it('is true when hints available', () => {
    const state = createQuizState(makeConfig());
    expect(state.canHint).toBe(true);
  });

  it('is false when no hints', () => {
    const state = createQuizState(makeConfigNoHints());
    expect(state.canHint).toBe(false);
  });

  it('is false after correct answer', () => {
    const state = createQuizState(makeConfig());
    state.input = 'correct';
    state.submit();
    expect(state.canHint).toBe(false);
  });
});
