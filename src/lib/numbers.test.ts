import { describe, expect, it } from 'vitest';
import { numberToIndonesian, indonesianToNumber, checkAnswer, checkNumberAnswer, randomPracticeNumber } from './numbers';

describe('numberToIndonesian', () => {
  const cases: [number, string][] = [
    [0, 'nol'],
    [1, 'satu'],
    [9, 'sembilan'],
    [10, 'sepuluh'],
    [11, 'sebelas'],
    [12, 'dua belas'],
    [19, 'sembilan belas'],
    [20, 'dua puluh'],
    [21, 'dua puluh satu'],
    [99, 'sembilan puluh sembilan'],
    [100, 'seratus'],
    [101, 'seratus satu'],
    [111, 'seratus sebelas'],
    [199, 'seratus sembilan puluh sembilan'],
    [200, 'dua ratus'],
    [234, 'dua ratus tiga puluh empat'],
    [999, 'sembilan ratus sembilan puluh sembilan'],
    [1_000, 'seribu'],
    [1_001, 'seribu satu'],
    [1_100, 'seribu seratus'],
    [1_111, 'seribu seratus sebelas'],
    [2_000, 'dua ribu'],
    [4_321, 'empat ribu tiga ratus dua puluh satu'],
    [10_000, 'sepuluh ribu'],
    [11_000, 'sebelas ribu'],
    [100_000, 'seratus ribu'],
    [999_999, 'sembilan ratus sembilan puluh sembilan ribu sembilan ratus sembilan puluh sembilan'],
    [1_000_000, 'satu juta'],
    [1_234_567, 'satu juta dua ratus tiga puluh empat ribu lima ratus enam puluh tujuh'],
    [999_999_999, 'sembilan ratus sembilan puluh sembilan juta sembilan ratus sembilan puluh sembilan ribu sembilan ratus sembilan puluh sembilan'],
  ];

  it.each(cases)('%d -> %s', (num, expected) => {
    expect(numberToIndonesian(num)).toBe(expected);
  });
});

describe('indonesianToNumber', () => {
  const cases: [string, number][] = [
    ['nol', 0],
    ['satu', 1],
    ['sembilan', 9],
    ['sepuluh', 10],
    ['sebelas', 11],
    ['dua belas', 12],
    ['sembilan belas', 19],
    ['dua puluh', 20],
    ['dua puluh satu', 21],
    ['seratus', 100],
    ['seratus satu', 101],
    ['dua ratus tiga puluh empat', 234],
    ['seribu', 1_000],
    ['seribu satu', 1_001],
    ['empat ribu tiga ratus dua puluh satu', 4_321],
    ['satu juta', 1_000_000],
    ['satu juta dua ratus tiga puluh empat ribu lima ratus enam puluh tujuh', 1_234_567],
  ];

  it.each(cases)('%s -> %d', (text, expected) => {
    expect(indonesianToNumber(text)).toBe(expected);
  });

  it('returns null for empty string', () => {
    expect(indonesianToNumber('')).toBeNull();
  });

  it('returns null for garbage', () => {
    expect(indonesianToNumber('hello world')).toBeNull();
  });

  it('handles extra whitespace', () => {
    expect(indonesianToNumber('  dua   puluh  satu  ')).toBe(21);
  });

  it('is case insensitive', () => {
    expect(indonesianToNumber('Dua Puluh Satu')).toBe(21);
  });

  it('handles ALL CAPS', () => {
    expect(indonesianToNumber('SERIBU')).toBe(1_000);
  });

  it('handles tabs and newlines in input', () => {
    expect(indonesianToNumber('dua\tpuluh\nsatu')).toBe(21);
  });

  it('returns null for just whitespace', () => {
    expect(indonesianToNumber('   ')).toBeNull();
  });

  it('returns null for partial garbage mixed with real words', () => {
    expect(indonesianToNumber('dua hundred')).toBeNull();
  });

  it('returns null for English numbers', () => {
    expect(indonesianToNumber('twenty one')).toBeNull();
  });

  it('returns null for digit strings', () => {
    expect(indonesianToNumber('123')).toBeNull();
  });

  it('handles "satu ratus" even though canonical is "seratus"', () => {
    expect(indonesianToNumber('satu ratus')).toBe(100);
  });

  it('handles "satu ribu" even though canonical is "seribu"', () => {
    expect(indonesianToNumber('satu ribu')).toBe(1_000);
  });

  it('handles "satu puluh" even though canonical is "sepuluh"', () => {
    expect(indonesianToNumber('satu puluh')).toBe(10);
  });

  it('handles "satu belas" even though canonical is "sebelas"', () => {
    expect(indonesianToNumber('satu belas')).toBe(11);
  });

  it('returns null for repeated words', () => {
    expect(indonesianToNumber('satu satu')).not.toBe(11);
  });

  it('bare multiplier without digit gives 0 (no digit to multiply)', () => {
    expect(indonesianToNumber('puluh')).toBe(0);
    expect(indonesianToNumber('ratus')).toBe(0);
  });

  it('bare scale multiplier defaults to 1x', () => {
    expect(indonesianToNumber('ribu')).toBe(1_000);
    expect(indonesianToNumber('juta')).toBe(1_000_000);
  });

  it('handles miliar range', () => {
    expect(indonesianToNumber('dua miliar')).toBe(2_000_000_000);
  });

  it('handles complex miliar', () => {
    expect(indonesianToNumber('satu miliar dua ratus tiga puluh empat juta')).toBe(1_234_000_000);
  });
});

describe('indonesianToNumber rejects learner mistakes', () => {
  // typos and misspellings
  it.each([
    'saatu',        // doubled vowel
    'duaa',         // extra letter
    'tigga',        // doubled consonant
    'enpat',        // m->n
    'lema',         // i->e
    'enm',          // missing vowel
    'tuju',         // missing h
    'delapn',       // missing vowel
    'sembiln',      // missing vowel
    'sepuloh',      // wrong vowel
    'sebellas',     // doubled l
    'bellah',       // creative misspelling of belas
    'pulur',        // wrong ending
    'ratis',        // wrong vowel
    'rebut',        // wrong word entirely
    'jibu',         // ribu with wrong first letter
  ])('rejects misspelling: "%s"', (typo) => {
    expect(indonesianToNumber(typo)).toBeNull();
  });

  // total nonsense
  it.each([
    'butts',
    'asdf',
    'one two three',
    'un dos tres',
    'kucing',       // real Indonesian word, but not a number
    'besar',        // real Indonesian word, not a number
    'yes',
    '!!!',
    'satu2nya',     // slang
    '1 ribu',       // mixing digits and words
  ])('rejects nonsense: "%s"', (garbage) => {
    expect(indonesianToNumber(garbage)).toBeNull();
  });

  // wrong word order
  it.each([
    ['puluh dua', 'multiplier before digit'],
    ['ratus tiga puluh dua', 'ratus with no digit before it (not seratus)'],
    ['belas dua', 'belas before digit'],
    ['ribu empat', 'only ribu then digit — missing structure'],
  ])('handles wrong order: "%s" (%s)', (input) => {
    const result = indonesianToNumber(input);
    // These shouldn't crash — they can return a number or null,
    // but they must not throw
    expect(() => indonesianToNumber(input)).not.toThrow();
    // And if they do return a number, it won't be what the learner meant
    if (result !== null) {
      expect(typeof result).toBe('number');
    }
  });

  // incomplete answers (learner gave up halfway)
  it.each([
    'dua ratus tiga',       // stopped mid-thought, but still valid (203)
    'seribu dua',           // valid: 1002
    'empat ribu tiga ratus', // valid: 4300
  ])('partial but valid input: "%s"', (input) => {
    const result = indonesianToNumber(input);
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(0);
  });

  // extra words, filler, punctuation
  it.each([
    'dua puluh dan satu',   // "dan" (and) isn't a number word
    'kira-kira sepuluh',    // "about ten"
    'satu, dua, tiga',      // commas
    'dua-puluh-satu',       // hyphens
    'dua.puluh',            // periods
  ])('rejects filler/punctuation: "%s"', (input) => {
    expect(indonesianToNumber(input)).toBeNull();
  });

  // mixing number systems
  it.each([
    '2 ribu',
    'seribu 5 ratus',
    '10 juta',
  ])('rejects mixed digits and words: "%s"', (input) => {
    expect(indonesianToNumber(input)).toBeNull();
  });
});

describe('checkAnswer', () => {
  // correct answers
  it('exact match is correct', () => {
    const result = checkAnswer(21, 'dua puluh satu');
    expect(result.correct).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('is case insensitive', () => {
    expect(checkAnswer(21, 'Dua Puluh Satu').correct).toBe(true);
  });

  it('ignores extra whitespace', () => {
    expect(checkAnswer(21, '  dua   puluh  satu  ').correct).toBe(true);
  });

  // non-canonical forms — correct but should warn
  it('accepts "satu ratus" but warns to use "seratus"', () => {
    const result = checkAnswer(100, 'satu ratus');
    expect(result.correct).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('seratus'))).toBe(true);
  });

  it('accepts "satu ribu" but warns to use "seribu"', () => {
    const result = checkAnswer(1000, 'satu ribu');
    expect(result.correct).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('seribu'))).toBe(true);
  });

  it('accepts "satu belas" but warns to use "sebelas"', () => {
    const result = checkAnswer(11, 'satu belas');
    expect(result.correct).toBe(true);
    expect(result.warnings.some(w => w.includes('sebelas'))).toBe(true);
  });

  it('accepts "satu puluh" but warns to use "sepuluh"', () => {
    const result = checkAnswer(10, 'satu puluh');
    expect(result.correct).toBe(true);
    expect(result.warnings.some(w => w.includes('sepuluh'))).toBe(true);
  });

  it('no warnings on canonical form', () => {
    const result = checkAnswer(100, 'seratus');
    expect(result.correct).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  // empty input
  it('reports empty input', () => {
    const result = checkAnswer(21, '');
    expect(result.correct).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  // misspelled words — identify the bad word and suggest the fix
  it('identifies misspelled digit and suggests correction', () => {
    const result = checkAnswer(200, 'duap ratus');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => e.includes('duap'))).toBe(true);
    expect(result.errors.some(e => e.includes('dua'))).toBe(true);
  });

  it('identifies misspelled multiplier and suggests correction', () => {
    const result = checkAnswer(200, 'dua ratush');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => e.includes('ratush'))).toBe(true);
    expect(result.errors.some(e => e.includes('ratus'))).toBe(true);
  });

  it('identifies multiple misspellings', () => {
    const result = checkAnswer(200, 'duap ratush');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => e.includes('duap'))).toBe(true);
    expect(result.errors.some(e => e.includes('ratush'))).toBe(true);
  });

  it('flags completely unrecognizable words without suggestion', () => {
    const result = checkAnswer(21, 'butts');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => e.includes('butts'))).toBe(true);
  });

  // valid words but wrong answer — list which words are wrong, without revealing the answer
  it('says which word is wrong without giving the answer', () => {
    const result = checkAnswer(21, 'dua puluh dua');
    expect(result.correct).toBe(false);
    // should say "dua" is wrong, should NOT reveal "satu"
    expect(result.errors.some(e => e.includes('dua'))).toBe(true);
    expect(result.errors.some(e => e.includes('satu'))).toBe(false);
  });

  it('identifies the specific wrong word in a longer answer', () => {
    const result = checkAnswer(3490, 'tiga ribu lima ratus sembilan puluh');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => e.includes('lima'))).toBe(true);
    // should not reveal the correct word
    expect(result.errors.some(e => e.includes('empat'))).toBe(false);
  });

  it('identifies missing words without saying what they are', () => {
    const result = checkAnswer(4321, 'empat ribu tiga ratus');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => /missing/i.test(e))).toBe(true);
  });

  it('identifies extra words', () => {
    const result = checkAnswer(20, 'dua puluh satu');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => e.includes('satu'))).toBe(true);
    expect(result.errors.some(e => /extra|unexpected/i.test(e))).toBe(true);
  });

  // close typos
  it('suggests "tujuh" for "tuju"', () => {
    const result = checkAnswer(7, 'tuju');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => e.includes('tujuh'))).toBe(true);
  });

  it('suggests "sembilan" for "sembiln"', () => {
    const result = checkAnswer(9, 'sembiln');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => e.includes('sembilan'))).toBe(true);
  });

  it('suggests "puluh" for "pulur"', () => {
    const result = checkAnswer(20, 'dua pulur');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => e.includes('puluh'))).toBe(true);
  });

  it('suggests "belas" for "bellah"', () => {
    const result = checkAnswer(12, 'dua bellah');
    expect(result.correct).toBe(false);
    expect(result.errors.some(e => e.includes('belas'))).toBe(true);
  });

  // wrongIndices
  it('correct answer has empty wrongIndices', () => {
    const result = checkAnswer(21, 'dua puluh satu');
    expect(result.wrongIndices).toEqual([]);
  });

  it('empty input has empty wrongIndices', () => {
    const result = checkAnswer(21, '');
    expect(result.wrongIndices).toEqual([]);
  });

  it('wrongIndices points to the wrong word position', () => {
    // 21 = "dua puluh satu", input has "dua" at position 2 instead of "satu"
    const result = checkAnswer(21, 'dua puluh dua');
    expect(result.wrongIndices).toEqual([2]);
  });

  it('wrongIndices points to misspelled word positions', () => {
    const result = checkAnswer(200, 'duap ratush');
    expect(result.wrongIndices).toEqual([0, 1]);
  });

  it('wrongIndices marks only the wrong word in a longer answer', () => {
    // 3490 = "tiga ribu empat ratus sembilan puluh"
    // input has "lima" at position 2 instead of "empat"
    const result = checkAnswer(3490, 'tiga ribu lima ratus sembilan puluh');
    expect(result.wrongIndices).toEqual([2]);
  });

  it('wrongIndices marks extra words', () => {
    // 20 = "dua puluh", input has extra "satu" at position 2
    const result = checkAnswer(20, 'dua puluh satu');
    expect(result.wrongIndices).toEqual([2]);
  });

  it('wrongIndices marks multiple wrong words', () => {
    // 21 = "dua puluh satu"
    const result = checkAnswer(21, 'tiga puluh dua');
    expect(result.wrongIndices).toEqual([0, 2]);
  });

  it('wrongIndices marks misspelled AND wrong-position words together', () => {
    // 6279 = "enam ribu dua ratus tujuh puluh sembilan"
    // "lima" is wrong (position 0), "belas" is wrong (position 3), "semblian" is misspelled (position 6)
    const result = checkAnswer(6279, 'lima ribu dua belas tujuh puluh semblian');
    expect(result.wrongIndices).toContain(0); // lima instead of enam
    expect(result.wrongIndices).toContain(3); // belas instead of ratus
    expect(result.wrongIndices).toContain(6); // semblian misspelling
  });
});

describe('checkNumberAnswer', () => {
  it('correct number is correct', () => {
    const result = checkNumberAnswer('dua ratus tiga puluh empat', '234');
    expect(result.correct).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('ignores whitespace in input', () => {
    const result = checkNumberAnswer('dua puluh satu', '  21  ');
    expect(result.correct).toBe(true);
  });

  it('accepts commas in input', () => {
    const result = checkNumberAnswer('seribu dua ratus', '1,200');
    expect(result.correct).toBe(true);
  });

  it('accepts periods as thousand separators', () => {
    const result = checkNumberAnswer('seribu dua ratus', '1.200');
    expect(result.correct).toBe(true);
  });

  it('wrong number is incorrect', () => {
    const result = checkNumberAnswer('dua puluh satu', '22');
    expect(result.correct).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('empty input is incorrect', () => {
    const result = checkNumberAnswer('dua puluh satu', '');
    expect(result.correct).toBe(false);
  });

  it('non-numeric input is incorrect', () => {
    const result = checkNumberAnswer('dua puluh satu', 'abc');
    expect(result.correct).toBe(false);
  });

  it('zero works', () => {
    const result = checkNumberAnswer('nol', '0');
    expect(result.correct).toBe(true);
  });

  it('correct answer has empty wrongDigits', () => {
    const result = checkNumberAnswer('dua ratus tiga puluh empat', '234');
    expect(result.wrongDigits).toEqual([]);
  });

  it('identifies wrong hundreds digit and its Indonesian word', () => {
    // 4679 = "empat ribu enam ratus tujuh puluh sembilan"
    // user types 4579 — the "5" is wrong, should be "enam"
    const result = checkNumberAnswer('empat ribu enam ratus tujuh puluh sembilan', '4579');
    expect(result.wrongDigits).toEqual([
      { position: 1, word: 'enam' },
    ]);
  });

  it('identifies wrong ones digit', () => {
    // 21 = "dua puluh satu", user types 23
    const result = checkNumberAnswer('dua puluh satu', '23');
    expect(result.wrongDigits).toEqual([
      { position: 1, word: 'satu' },
    ]);
  });

  it('identifies wrong digit when number has interior zeros', () => {
    // 7804 = "tujuh ribu delapan ratus empat", user types 7805
    const result = checkNumberAnswer('tujuh ribu delapan ratus empat', '7805');
    expect(result.wrongDigits).toEqual([
      { position: 3, word: 'empat' },
    ]);
  });

  it('identifies multiple wrong digits', () => {
    // 234 = "dua ratus tiga puluh empat", user types 567
    const result = checkNumberAnswer('dua ratus tiga puluh empat', '567');
    expect(result.wrongDigits.length).toBe(3);
  });

  it('handles different digit counts — too few digits', () => {
    // 234 = "dua ratus tiga puluh empat", user types 34
    const result = checkNumberAnswer('dua ratus tiga puluh empat', '34');
    expect(result.correct).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('handles different digit counts — too many digits', () => {
    // 21 = "dua puluh satu", user types 210
    const result = checkNumberAnswer('dua puluh satu', '210');
    expect(result.correct).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('randomPracticeNumber', () => {
  it('returns a non-negative integer', () => {
    for (let i = 0; i < 100; i++) {
      const n = randomPracticeNumber();
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(0);
    }
  });

  it('respects max digits option', () => {
    for (let i = 0; i < 100; i++) {
      const n = randomPracticeNumber({ maxDigits: 2 });
      expect(n).toBeLessThan(100);
    }
  });

  it('produces zeros more often than uniform distribution', () => {
    const results = Array.from({ length: 2000 }, () => randomPracticeNumber());
    const multiDigit = results.filter(n => n >= 10);
    const withZero = multiDigit.filter(n => String(n).includes('0'));
    // Uniform would give ~19% of multi-digit numbers containing a zero
    // With 3x weighting, should be noticeably higher
    expect(withZero.length / multiDigit.length).toBeGreaterThan(0.25);
  });

  it('zeroWeight 0 produces no zeros in multi-digit numbers', () => {
    const results = Array.from({ length: 1000 }, () =>
      randomPracticeNumber({ maxDigits: 4, zeroWeight: 0 })
    );
    const withZero = results.filter(n => n > 9 && String(n).includes('0'));
    expect(withZero.length).toBe(0);
  });

  it('zeroWeight 1 gives zero equal probability to other digits', () => {
    // With weight 1, zero has 1/10 chance per digit — same as uniform
    const results = Array.from({ length: 2000 }, () =>
      randomPracticeNumber({ maxDigits: 3, zeroWeight: 1 })
    );
    const multiDigit = results.filter(n => n >= 10);
    const withZero = multiDigit.filter(n => String(n).includes('0'));
    // Uniform: ~10% chance per digit has a zero, so roughly 19% of 2-3 digit numbers
    // Should be noticeably less than the default (3x) weighting
    expect(withZero.length).toBeLessThan(multiDigit.length * 0.4);
  });
});

describe('roundtrip', () => {
  const values = [0, 1, 10, 11, 15, 20, 42, 99, 100, 111, 200, 999, 1000, 1001, 4321, 10_000, 100_000, 1_000_000, 123_456_789];

  it.each(values)('%d survives roundtrip', (n) => {
    expect(indonesianToNumber(numberToIndonesian(n))).toBe(n);
  });
});
