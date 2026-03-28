import { describe, expect, it } from 'vitest';
import { MONTHS } from './months';

const enToId = MONTHS.quiz('en', 'id');
const idToEn = MONTHS.quiz('id', 'en');

describe('months en→id', () => {
  it('has correct slug', () => {
    expect(enToId.slug).toBe('months-to-indonesian');
  });

  it('generates prompt and answer', () => {
    const q = enToId.generate();
    expect(q.prompt).toMatch(/^[A-Z]/);
    expect(q.answer).toMatch(/^[A-Z]/);
  });

  it('checks correct answer', () => {
    const q = enToId.generate();
    const result = enToId.check(q.answer, q.answer);
    expect(result.correct).toBe(true);
  });

  it('checks wrong answer', () => {
    const q = enToId.generate();
    const result = enToId.check(q.answer, 'xyzxyz');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans.length).toBeGreaterThan(0);
  });

  it('builds hints for an answer', () => {
    if (!enToId.buildHints) throw new Error('buildHints should be defined for vocab quizzes');
    const hints = enToId.buildHints('Januari');
    expect(hints[0]).toBe('_ _ _ _ _ _ _');
    expect(hints[1]).toBe('J _ _ _ _ _ _');
  });

  it('avoids repeating previous prompt', () => {
    const first = enToId.generate();
    for (let i = 0; i < 30; i++) {
      const next = enToId.generate(first);
      expect(next.prompt).not.toBe(first.prompt);
    }
  });
});

describe('months id→en', () => {
  it('has correct slug', () => {
    expect(idToEn.slug).toBe('months-to-english');
  });

  it('generates prompt and answer', () => {
    const q = idToEn.generate();
    expect(q.prompt).toMatch(/^[A-Z]/);
    expect(q.answer).toMatch(/^[A-Z]/);
  });

  it('checks correct answer', () => {
    const q = idToEn.generate();
    const result = idToEn.check(q.answer, q.answer);
    expect(result.correct).toBe(true);
  });
});
