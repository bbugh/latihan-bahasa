import { describe, expect, it } from 'vitest';
import { COLORS } from './colors';

const enToId = COLORS.quiz('en', 'id');
const idToEn = COLORS.quiz('id', 'en');

describe('colors en→id', () => {
  it('has correct category', () => {
    expect(enToId.category).toBe('Colors');
  });

  it('generates prompt and answer', () => {
    const q = enToId.generate();
    expect(q.prompt).toBeTruthy();
    expect(q.answer).toBeTruthy();
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

  it('accepts alternate indonesian spelling "Coklat"', () => {
    const result = enToId.check('Cokelat', 'Coklat');
    expect(result.correct).toBe(true);
  });

  it('builds hints', () => {
    if (!enToId.buildHints) throw new Error('buildHints should be defined');
    const hints = enToId.buildHints('Merah');
    expect(hints[0]).toBe('_ _ _ _ _');
    expect(hints[1]).toBe('M _ _ _ _');
  });

  it('handles multi-word answer "Merah Muda"', () => {
    const result = enToId.check('Merah Muda', 'Merah Biru');
    expect(result.correct).toBe(false);
    expect(result.wrongSpans).toEqual([[6, 10]]);
  });

  it('handles "Abu-abu"', () => {
    const result = enToId.check('Abu-abu', 'Abu-abu');
    expect(result.correct).toBe(true);
  });

  it('avoids repeating previous prompt', () => {
    const first = enToId.generate();
    for (let i = 0; i < 30; i++) {
      const next = enToId.generate(first);
      expect(next.prompt).not.toBe(first.prompt);
    }
  });
});

describe('colors id→en', () => {
  it('generates prompt and answer', () => {
    const q = idToEn.generate();
    expect(q.prompt).toBeTruthy();
    expect(q.answer).toBeTruthy();
  });

  it('checks correct answer', () => {
    const q = idToEn.generate();
    const result = idToEn.check(q.answer, q.answer);
    expect(result.correct).toBe(true);
  });

  it('accepts "Gray" when answer is "Grey"', () => {
    const result = idToEn.check('Grey', 'Gray');
    expect(result.correct).toBe(true);
  });

  it('accepts "gray" case-insensitively', () => {
    const result = idToEn.check('Grey', 'gray');
    expect(result.correct).toBe(true);
  });
});
