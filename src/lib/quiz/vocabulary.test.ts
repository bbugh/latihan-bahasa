import { describe, expect, it } from 'vitest';
import { vocabCheck, randomItem, makeVocabQuizPair, type VocabItem } from './vocabulary';

const TEST_ITEMS: VocabItem[] = [
  { english: 'January', indonesian: 'Januari' },
  { english: 'February', indonesian: 'Februari' },
  { english: 'March', indonesian: 'Maret' },
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
      const item = randomItem(TEST_ITEMS, undefined, i => i.english);
      expect(TEST_ITEMS).toContainEqual(item);
    }
  });

  it('avoids repeating the previous prompt', () => {
    const prev = { prompt: 'January', answer: 'Januari' };
    for (let i = 0; i < 30; i++) {
      const item = randomItem(TEST_ITEMS, prev, i => i.english);
      expect(item.english).not.toBe('January');
    }
  });

  it('returns the only item when array has one element', () => {
    const single = [TEST_ITEMS[0]];
    const item = randomItem(single, undefined, i => i.english);
    expect(item).toBe(single[0]);
  });
});

describe('makeVocabQuizPair', () => {
  const [forward, reverse] = makeVocabQuizPair({
    category: 'Months',
    items: TEST_ITEMS,
    fromLabel: 'English',
    toLabel: 'Indonesian',
  });

  it('generates forward definition with correct metadata', () => {
    expect(forward.slug).toBe('months-to-indonesian');
    expect(forward.title).toBe('Months \u2192 Indonesian');
    expect(forward.category).toBe('Months');
    expect(forward.promptStyle).toBe('text');
    expect(forward.inputMode).toBe('text');
  });

  it('generates reverse definition with correct metadata', () => {
    expect(reverse.slug).toBe('months-to-english');
    expect(reverse.title).toBe('Months \u2192 English');
    expect(reverse.category).toBe('Months');
  });

  it('forward generates english prompt with indonesian answer', () => {
    const q = forward.generate();
    const englishNames = TEST_ITEMS.map(i => i.english);
    const indonesianNames = TEST_ITEMS.map(i => i.indonesian);
    expect(englishNames).toContain(q.prompt);
    expect(indonesianNames).toContain(q.answer);
  });

  it('reverse generates indonesian prompt with english answer', () => {
    const q = reverse.generate();
    const englishNames = TEST_ITEMS.map(i => i.english);
    const indonesianNames = TEST_ITEMS.map(i => i.indonesian);
    expect(indonesianNames).toContain(q.prompt);
    expect(englishNames).toContain(q.answer);
  });

  it('forward check accepts correct answer', () => {
    const q = forward.generate();
    const result = forward.check(q.answer, q.answer);
    expect(result.correct).toBe(true);
  });

  it('reverse check accepts correct answer', () => {
    const q = reverse.generate();
    const result = reverse.check(q.answer, q.answer);
    expect(result.correct).toBe(true);
  });

  it('forward buildHints returns hints', () => {
    const hints = forward.buildHints('Januari');
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toBe('_ _ _ _ _ _ _');
  });

  it('avoids repeating the previous prompt', () => {
    const first = forward.generate();
    for (let i = 0; i < 30; i++) {
      const next = forward.generate(first);
      expect(next.prompt).not.toBe(first.prompt);
    }
  });
});
