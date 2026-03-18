import { describe, expect, it } from 'vitest';
import { numberToIndonesian, indonesianToNumber } from './numbers';

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
});

describe('roundtrip', () => {
  const values = [0, 1, 10, 11, 15, 20, 42, 99, 100, 111, 200, 999, 1000, 1001, 4321, 10_000, 100_000, 1_000_000, 123_456_789];

  it.each(values)('%d survives roundtrip', (n) => {
    expect(indonesianToNumber(numberToIndonesian(n))).toBe(n);
  });
});
