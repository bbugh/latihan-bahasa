import { describe, expect, it } from 'vitest';
import { wordErrorHighlightRanges, digitErrorHighlightRanges } from './highlights';

describe('wordErrorHighlightRanges', () => {
  it('returns empty for no wrong indices', () => {
    expect(wordErrorHighlightRanges('hello world', [])).toEqual([]);
  });

  it('highlights a single wrong word', () => {
    expect(wordErrorHighlightRanges('hello world', [1])).toEqual([[6, 11]]);
  });

  it('highlights the first word', () => {
    expect(wordErrorHighlightRanges('hello world', [0])).toEqual([[0, 5]]);
  });

  it('highlights multiple wrong words', () => {
    expect(wordErrorHighlightRanges('one two three', [0, 2])).toEqual([[0, 3], [8, 13]]);
  });

  it('handles multiple spaces between words', () => {
    expect(wordErrorHighlightRanges('one  two', [1])).toEqual([[5, 8]]);
  });

  it('handles leading spaces', () => {
    expect(wordErrorHighlightRanges(' hello', [0])).toEqual([[1, 6]]);
  });

  it('highlights all words', () => {
    expect(wordErrorHighlightRanges('a b c', [0, 1, 2])).toEqual([[0, 1], [2, 3], [4, 5]]);
  });

  it('returns empty for empty input', () => {
    expect(wordErrorHighlightRanges('', [0])).toEqual([]);
  });
});

describe('digitErrorHighlightRanges', () => {
  it('returns empty for no wrong digits', () => {
    expect(digitErrorHighlightRanges([])).toEqual([]);
  });

  it('converts single digit position', () => {
    expect(digitErrorHighlightRanges([{ position: 0 }])).toEqual([[0, 1]]);
  });

  it('converts multiple digit positions', () => {
    expect(digitErrorHighlightRanges([{ position: 1 }, { position: 3 }])).toEqual([[1, 2], [3, 4]]);
  });
});
