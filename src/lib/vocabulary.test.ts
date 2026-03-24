import { describe, expect, it } from 'vitest';
import { checkVocabularyAnswer, randomPracticeItem, type VocabularySet } from './vocabulary';

const testSet: VocabularySet = {
  items: [
    { prompt: 'January', answer: 'Januari' },
    { prompt: 'February', answer: 'Februari' },
    { prompt: 'March', answer: 'Maret' },
  ],
};

describe('checkVocabularyAnswer', () => {
  it('correct answer is correct', () => {
    const result = checkVocabularyAnswer('Januari', 'Januari');
    expect(result.correct).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('is case insensitive', () => {
    const result = checkVocabularyAnswer('Januari', 'januari');
    expect(result.correct).toBe(true);
  });

  it('ignores extra whitespace', () => {
    const result = checkVocabularyAnswer('Januari', '  januari  ');
    expect(result.correct).toBe(true);
  });

  it('wrong answer is incorrect', () => {
    const result = checkVocabularyAnswer('Januari', 'Februari');
    expect(result.correct).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('empty input is incorrect', () => {
    const result = checkVocabularyAnswer('Januari', '');
    expect(result.correct).toBe(false);
  });

  it('suggests correction for close misspelling', () => {
    const result = checkVocabularyAnswer('Januari', 'Janueri');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => /close|almost|did you mean/i.test(e))).toBe(true);
  });
});

describe('randomPracticeItem', () => {
  it('returns an item from the set', () => {
    for (let i = 0; i < 20; i++) {
      const item = randomPracticeItem(testSet);
      expect(testSet.items).toContainEqual(item);
    }
  });

  it('avoids repeating the previous item', () => {
    const prev = testSet.items[0];
    for (let i = 0; i < 30; i++) {
      const item = randomPracticeItem(testSet, prev);
      expect(item).not.toEqual(prev);
    }
  });
});
