import { describe, expect, it } from 'vitest';
import { colorsToIndonesian, colorsToEnglish } from './colors';

describe('colorsToIndonesian', () => {
  it('has correct slug', () => {
    expect(colorsToIndonesian.slug).toBe('colors-to-indonesian');
  });

  it('has correct category', () => {
    expect(colorsToIndonesian.category).toBe('Colors');
  });

  it('generates english prompt with indonesian answer', () => {
    const q = colorsToIndonesian.generate();
    expect(q.prompt).toBeTruthy();
    expect(q.answer).toBeTruthy();
  });

  it('checks correct answer', () => {
    const q = colorsToIndonesian.generate();
    const result = colorsToIndonesian.check(q.answer, q.answer);
    expect(result.correct).toBe(true);
  });

  it('checks wrong answer', () => {
    const q = colorsToIndonesian.generate();
    const result = colorsToIndonesian.check(q.answer, 'xyzxyz');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans.length).toBeGreaterThan(0);
  });

  it('builds hints', () => {
    if (!colorsToIndonesian.buildHints) throw new Error('buildHints should be defined for vocab quizzes');
    const hints = colorsToIndonesian.buildHints('Merah');
    expect(hints[0]).toBe('_ _ _ _ _');
    expect(hints[1]).toBe('M _ _ _ _');
  });

  it('handles multi-word answer "Merah Muda"', () => {
    const result = colorsToIndonesian.check('Merah Muda', 'Merah Biru');
    expect(result.correct).toBe(false);
    // Only "Biru" should be highlighted, not "Merah"
    expect(result.wrongSpans).toEqual([[6, 10]]);
  });

  it('handles multi-word answer "Abu-abu"', () => {
    const result = colorsToIndonesian.check('Abu-abu', 'Abu-abu');
    expect(result.correct).toBe(true);
  });

  it('avoids repeating previous prompt', () => {
    const first = colorsToIndonesian.generate();
    for (let i = 0; i < 30; i++) {
      const next = colorsToIndonesian.generate(first);
      expect(next.prompt).not.toBe(first.prompt);
    }
  });
});

describe('colorsToEnglish', () => {
  it('has correct slug', () => {
    expect(colorsToEnglish.slug).toBe('colors-to-english');
  });

  it('generates indonesian prompt with english answer', () => {
    const q = colorsToEnglish.generate();
    expect(q.prompt).toBeTruthy();
    expect(q.answer).toBeTruthy();
  });

  it('checks correct answer', () => {
    const q = colorsToEnglish.generate();
    const result = colorsToEnglish.check(q.answer, q.answer);
    expect(result.correct).toBe(true);
  });

  it('accepts "Gray" as alternate spelling for "Grey"', () => {
    const result = colorsToEnglish.check('Grey', 'Gray');
    expect(result.correct).toBe(true);
  });

  it('accepts "gray" case-insensitively', () => {
    const result = colorsToEnglish.check('Grey', 'gray');
    expect(result.correct).toBe(true);
  });
});
