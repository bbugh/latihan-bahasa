import { describe, expect, it } from 'vitest';
import { QUIZ_REGISTRY, QUIZ_BY_SLUG } from './quizzes';
import type { QuizCheckResult, QuizQuestion } from './quiz';

describe('QUIZ_REGISTRY', () => {
  it('contains all four quiz configs', () => {
    expect(QUIZ_REGISTRY.length).toBe(4);
  });

  it('each config has required fields', () => {
    for (const config of QUIZ_REGISTRY) {
      expect(config.slug).toBeTruthy();
      expect(config.title).toBeTruthy();
      expect(config.description).toBeTruthy();
      expect(config.category).toBeTruthy();
      expect(config.instruction).toBeTruthy();
      expect(typeof config.generate).toBe('function');
    }
  });

  it('slugs are unique', () => {
    const slugs = QUIZ_REGISTRY.map(c => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('QUIZ_BY_SLUG', () => {
  it('looks up by slug', () => {
    expect(QUIZ_BY_SLUG.get('numbers-to-words')).toBeTruthy();
    expect(QUIZ_BY_SLUG.get('words-to-numbers')).toBeTruthy();
    expect(QUIZ_BY_SLUG.get('months-to-indonesian')).toBeTruthy();
    expect(QUIZ_BY_SLUG.get('months-to-english')).toBeTruthy();
  });
});

describe('numbers-to-words quiz', () => {
  const config = QUIZ_BY_SLUG.get('numbers-to-words')!;

  it('generates a question with expected shape', () => {
    const q = config.generate();
    expect(q.prompt).toBeTruthy();
    expect(q.answer).toBeTruthy();
    expect(q.promptStyle).toBe('number');
    expect(q.inputMode).toBe('text');
    expect(q.hints).toEqual([]);
    expect(typeof q.check).toBe('function');
  });

  it('check returns correct for right answer', () => {
    const q = config.generate();
    const result = q.check(q.answer);
    expect(result.correct).toBe(true);
    expect(result.wrongSpans).toEqual([]);
  });

  it('check returns wrongSpans for wrong words', () => {
    // Generate a question, then give a wrong answer
    const q = config.generate();
    const result = q.check('zzz qqq');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans.length).toBeGreaterThan(0);
    // Each span should be [start, end) within the input
    for (const [start, end] of result.wrongSpans) {
      expect(start).toBeGreaterThanOrEqual(0);
      expect(end).toBeGreaterThan(start);
      expect(end).toBeLessThanOrEqual('zzz qqq'.length);
    }
  });
});

describe('words-to-numbers quiz', () => {
  const config = QUIZ_BY_SLUG.get('words-to-numbers')!;

  it('generates a question with expected shape', () => {
    const q = config.generate();
    expect(q.prompt).toBeTruthy();
    expect(q.answer).toBeTruthy();
    expect(q.promptStyle).toBe('text');
    expect(q.inputMode).toBe('numeric');
    expect(q.hints).toEqual([]);
    expect(typeof q.check).toBe('function');
  });

  it('check returns correct for right answer', () => {
    const q = config.generate();
    const result = q.check(q.answer);
    expect(result.correct).toBe(true);
  });

  it('check returns wrongSpans for wrong digits', () => {
    const q = config.generate();
    // Make a wrong answer with same length
    const wrongAnswer = q.answer === '0' ? '1' : '0'.repeat(q.answer.length);
    const result = q.check(wrongAnswer);
    if (!result.correct) {
      for (const [start, end] of result.wrongSpans) {
        expect(start).toBeGreaterThanOrEqual(0);
        expect(end).toBeGreaterThan(start);
      }
    }
  });
});

describe('months-to-indonesian quiz', () => {
  const config = QUIZ_BY_SLUG.get('months-to-indonesian')!;

  it('generates a question with hints', () => {
    const q = config.generate();
    expect(q.prompt).toBeTruthy();
    expect(q.answer).toBeTruthy();
    expect(q.promptStyle).toBe('text');
    expect(q.inputMode).toBe('text');
    expect(q.hints.length).toBeGreaterThan(0);
  });

  it('check returns correct for right answer', () => {
    const q = config.generate();
    const result = q.check(q.answer);
    expect(result.correct).toBe(true);
  });

  it('check is case insensitive', () => {
    const q = config.generate();
    const result = q.check(q.answer.toLowerCase());
    expect(result.correct).toBe(true);
  });

  it('check highlights the whole word for a single-word misspelling', () => {
    const q = config.generate();
    const chars = [...q.answer];
    if (chars.length > 3) {
      [chars[1], chars[2]] = [chars[2], chars[1]];
      const misspelled = chars.join('');
      const result = q.check(misspelled);
      if (!result.correct) {
        // Single-word answer: entire word should be one span
        expect(result.wrongSpans).toEqual([[0, misspelled.length]]);
      }
    }
  });
});

describe('vocabulary wrongSpans', () => {
  const config = QUIZ_BY_SLUG.get('months-to-indonesian')!;

  function generateFor(prompt: string): QuizQuestion {
    let q: QuizQuestion;
    // Generate until we get the target prompt
    for (let i = 0; i < 200; i++) {
      q = config.generate();
      if (q.prompt === prompt) return q;
    }
    throw new Error(`Could not generate question for "${prompt}"`);
  }

  it('returns no wrongSpans for correct answer', () => {
    const q = generateFor('January');
    const result = q.check('Januari');
    expect(result.correct).toBe(true);
    expect(result.wrongSpans).toEqual([]);
  });

  it('returns no wrongSpans for empty input', () => {
    const q = generateFor('January');
    const result = q.check('');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([]);
  });

  it('returns no wrongSpans for whitespace-only input', () => {
    const q = generateFor('January');
    const result = q.check('   ');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([]);
  });

  it('highlights entire single word when wrong', () => {
    const q = generateFor('January');
    const result = q.check('Februari');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([[0, 'Februari'.length]]);
  });

  it('highlights extra words beyond expected', () => {
    const q = generateFor('January');
    const result = q.check('Januari extra');
    expect(result.correct).toBe(false);
    // "extra" starts at index 8
    expect(result.wrongSpans).toEqual([[8, 13]]);
  });

  it('highlights all words when completely wrong', () => {
    const q = generateFor('January');
    const result = q.check('abc def');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([[0, 3], [4, 7]]);
  });

  it('handles leading and trailing spaces in input', () => {
    const q = generateFor('January');
    // checkVocabularyAnswer trims, but wrongSpans uses the trimmed value
    const result = q.check('  Februari  ');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([[0, 'Februari'.length]]);
  });
});

describe('months-to-english quiz', () => {
  const config = QUIZ_BY_SLUG.get('months-to-english')!;

  it('generates a question with hints', () => {
    const q = config.generate();
    expect(q.hints.length).toBeGreaterThan(0);
  });

  it('avoids repeating previous question', () => {
    const first = config.generate();
    const results = new Set<string>();
    for (let i = 0; i < 30; i++) {
      results.add(config.generate(first).prompt);
    }
    // Should never get the same prompt as "previous"
    expect(results.has(first.prompt)).toBe(false);
  });
});

describe('QuizCheckResult shape', () => {
  it('always has warnings array even when empty', () => {
    for (const config of QUIZ_REGISTRY) {
      const q = config.generate();
      const result = q.check(q.answer);
      expect(Array.isArray(result.warnings)).toBe(true);
    }
  });
});
