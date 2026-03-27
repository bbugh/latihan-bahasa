import { describe, expect, it } from 'vitest';
import { buildHints } from './hints';

describe('buildHints', () => {
  it('first hint shows length with all blanks', () => {
    const hints = buildHints('April');
    expect(hints[0]).toBe('_ _ _ _ _');
  });

  it('second hint reveals first letter', () => {
    const hints = buildHints('April');
    expect(hints[1]).toBe('A _ _ _ _');
  });

  it('skips first sound hint when same as first letter', () => {
    const hints = buildHints('April');
    // No digraph, so after first letter comes last letter
    expect(hints[2]).toBe('A _ _ _ l');
  });

  it('includes first sound hint when different from first letter', () => {
    const hints = buildHints('Chair', 'Ch');
    expect(hints[0]).toBe('_ _ _ _ _');
    expect(hints[1]).toBe('C _ _ _ _');
    expect(hints[2]).toBe('C h _ _ _');
    expect(hints[3]).toBe('C h _ _ r');
  });

  it('reveals random interior letters after last letter', () => {
    const hints = buildHints('Maret');
    // hints[0] = "_ _ _ _ _" (length)
    // hints[1] = "M _ _ _ _" (first letter)
    // hints[2] = "M _ _ _ t" (last letter, first sound skipped)
    // hints[3..5] = interior letters revealed one at a time
    expect(hints.length).toBe(6); // length + first + last + 3 interior (a, r, e)

    // Each subsequent hint should have exactly one more letter revealed
    for (let i = 3; i < hints.length; i++) {
      const prevBlanks = (hints[i - 1].match(/_/g) || []).length;
      const curBlanks = (hints[i].match(/_/g) || []).length;
      expect(curBlanks).toBe(prevBlanks - 1);
    }
  });

  it('last hint reveals all letters', () => {
    const hints = buildHints('Mei');
    const last = hints[hints.length - 1];
    expect(last).toBe('M e i');
  });

  it('preserves letter casing', () => {
    const hints = buildHints('Oktober');
    expect(hints[1]).toBe('O _ _ _ _ _ _');
  });

  it('handles two-letter words', () => {
    const hints = buildHints('Go');
    expect(hints[0]).toBe('_ _');
    expect(hints[1]).toBe('G _');
    expect(hints[2]).toBe('G o');
  });

  it('handles single-letter words', () => {
    const hints = buildHints('A');
    expect(hints[0]).toBe('_');
    expect(hints[1]).toBe('A');
  });

  it('first sound hint reveals multiple characters', () => {
    const hints = buildHints('Thursday', 'Th');
    expect(hints[2]).toBe('T h _ _ _ _ _ _');
  });

  it('case-insensitive first sound matching', () => {
    // firstSound "ch" should match "C" at start of "Chair"
    const hints = buildHints('Chair', 'ch');
    expect(hints[2]).toBe('C h _ _ _');
  });
});
