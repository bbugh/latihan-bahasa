import { describe, expect, it } from 'vitest';
import { monthsToIndonesian, monthsToEnglish } from './months';

describe('monthsToIndonesian', () => {
  it('has correct slug', () => {
    expect(monthsToIndonesian.slug).toBe('months-to-indonesian');
  });

  it('generates english prompt with indonesian answer', () => {
    const q = monthsToIndonesian.generate();
    expect(q.prompt).toMatch(/^[A-Z]/);
    expect(q.answer).toMatch(/^[A-Z]/);
  });

  it('checks correct answer', () => {
    const q = monthsToIndonesian.generate();
    const result = monthsToIndonesian.check(q.answer, q.answer);
    expect(result.correct).toBe(true);
  });

  it('checks wrong answer', () => {
    const q = monthsToIndonesian.generate();
    const result = monthsToIndonesian.check(q.answer, 'xyzxyz');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans.length).toBeGreaterThan(0);
  });

  it('builds hints for an answer', () => {
    const hints = monthsToIndonesian.buildHints('Januari');
    expect(hints[0]).toBe('_ _ _ _ _ _ _');
    expect(hints[1]).toBe('J _ _ _ _ _ _');
  });

  it('avoids repeating previous prompt', () => {
    const first = monthsToIndonesian.generate();
    for (let i = 0; i < 30; i++) {
      const next = monthsToIndonesian.generate(first);
      expect(next.prompt).not.toBe(first.prompt);
    }
  });
});

describe('monthsToEnglish', () => {
  it('has correct slug', () => {
    expect(monthsToEnglish.slug).toBe('months-to-english');
  });

  it('generates indonesian prompt with english answer', () => {
    const q = monthsToEnglish.generate();
    // Both directions have capitalized names
    expect(q.prompt).toMatch(/^[A-Z]/);
    expect(q.answer).toMatch(/^[A-Z]/);
  });

  it('checks correct answer', () => {
    const q = monthsToEnglish.generate();
    const result = monthsToEnglish.check(q.answer, q.answer);
    expect(result.correct).toBe(true);
  });
});
