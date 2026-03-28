import { describe, expect, it } from 'vitest';
import { vocabCheck, randomItem, defineVocabSet } from './vocabulary';

const TEST_ITEMS = [
  { en: 'January', id: 'Januari' },
  { en: 'February', id: 'Februari' },
  { en: 'March', id: 'Maret' },
];

describe('vocabCheck', () => {
  it('correct answer is correct', () => {
    const result = vocabCheck('Januari', 'Januari');
    expect(result.correct).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.wrongSpans).toEqual([]);
  });

  it('is case insensitive', () => {
    const result = vocabCheck('Januari', 'januari');
    expect(result.correct).toBe(true);
  });

  it('ignores extra whitespace', () => {
    const result = vocabCheck('Januari', '  januari  ');
    expect(result.correct).toBe(true);
  });

  it('wrong answer is incorrect', () => {
    const result = vocabCheck('Januari', 'Februari');
    expect(result.correct).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('empty input is incorrect with no spans', () => {
    const result = vocabCheck('Januari', '');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([]);
  });

  it('whitespace-only input is incorrect with no spans', () => {
    const result = vocabCheck('Januari', '   ');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([]);
  });

  it('says almost for close misspelling without revealing answer', () => {
    const result = vocabCheck('Januari', 'Janueri');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => /almost.*highlighted/i.test(e))).toBe(true);
    expect(result.errors.some(e => e.includes('Januari'))).toBe(false);
  });

  it('highlights entire single word when wrong', () => {
    const result = vocabCheck('Januari', 'Februari');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([[0, 'Februari'.length]]);
  });

  it('highlights extra words beyond expected', () => {
    const result = vocabCheck('Januari', 'Januari extra');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([[8, 13]]);
  });

  it('highlights all words when completely wrong', () => {
    const result = vocabCheck('Januari', 'abc def');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([[0, 3], [4, 7]]);
  });

  it('aligns highlight ranges with raw input when there are leading spaces', () => {
    const result = vocabCheck('Januari', '  Februari');
    expect(result.correct).toBe(false);
    // Word starts at index 2, not 0
    expect(result.wrongSpans).toEqual([[2, 10]]);
  });

  it('aligns highlight ranges with raw input when there are trailing spaces', () => {
    const result = vocabCheck('Januari', 'Februari  ');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([[0, 8]]);
  });
});

describe('randomItem', () => {
  it('returns an item from the array', () => {
    for (let i = 0; i < 20; i++) {
      const item = randomItem(TEST_ITEMS, undefined, i => i.en);
      expect(TEST_ITEMS).toContainEqual(item);
    }
  });

  it('avoids repeating the previous prompt', () => {
    const prev = { prompt: 'January', answer: 'Januari' };
    for (let i = 0; i < 30; i++) {
      const item = randomItem(TEST_ITEMS, prev, i => i.en);
      expect(item.en).not.toBe('January');
    }
  });

  it('returns the only item when array has one element', () => {
    const single = [TEST_ITEMS[0]];
    const item = randomItem(single, undefined, i => i.en);
    expect(item).toBe(single[0]);
  });
});

describe('defineVocabSet', () => {
  const set = defineVocabSet({
    category: 'Colors',
    items: [
      { en: ['Red'], id: ['Merah'] },
      { en: ['Brown'], id: ['Cokelat', 'Coklat'] },
      { 'en-US': ['Gray'], 'en-GB': ['Grey'], id: ['Abu-abu'] },
    ],
  });

  it('returns category', () => {
    expect(set.category).toBe('Colors');
  });

  it('returns items', () => {
    expect(set.items.length).toBe(3);
  });

  it('reports available languages', () => {
    expect(set.languages).toContain('en');
    expect(set.languages).toContain('id');
  });

  it('includes base language from locale-specific keys', () => {
    // en-US and en-GB should both contribute "en" to languages
    expect(set.languages).toContain('en');
  });

  it('generates a quiz for a language pair', () => {
    const quiz = set.quiz('en', 'id');
    expect(quiz.slug).toBe('colors-to-indonesian');
    expect(quiz.category).toBe('Colors');
  });

  it('generated quiz check accepts correct answer', () => {
    const quiz = set.quiz('en', 'id');
    const q = quiz.generate();
    const result = quiz.check(q.answer, q.answer);
    expect(result.correct).toBe(true);
  });

  it('generated quiz check accepts alternate spellings', () => {
    const quiz = set.quiz('en', 'id');
    // "Coklat" is alternate for "Cokelat"
    const result = quiz.check('Cokelat', 'Coklat');
    expect(result.correct).toBe(true);
  });

  it('generated quiz accepts any locale spelling for answer', () => {
    // id→en: both "Gray" (en-US) and "Grey" (en-GB) are valid English answers
    const reverseQuiz = set.quiz('id', 'en');
    const result = reverseQuiz.check('Gray', 'Grey');
    expect(result.correct).toBe(true);
  });

  it('generated quiz displays first spelling as prompt', () => {
    const quiz = set.quiz('en', 'id');
    // Generate until we get Brown
    for (let i = 0; i < 100; i++) {
      const q = quiz.generate();
      if (q.answer === 'Cokelat') {
        // Prompt should be first en spelling
        expect(q.prompt).toBe('Brown');
        return;
      }
    }
    throw new Error('Never generated Brown');
  });

  it('generated quiz builds hints', () => {
    const quiz = set.quiz('en', 'id');
    if (!quiz.buildHints) throw new Error('buildHints should be defined');
    const hints = quiz.buildHints('Merah');
    expect(hints[0]).toBe('_ _ _ _ _');
  });

  it('throws for unsupported language pair', () => {
    expect(() => set.quiz('en', 'es')).toThrow();
  });
});
