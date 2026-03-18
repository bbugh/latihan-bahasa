const ONES = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
const SCALES = ['', 'ribu', 'juta', 'miliar', 'triliun', 'kuadriliun'];

export function numberToIndonesian(x: number): string {
  if (!x) return 'nol';

  const parts: string[] = [];

  for (let scale = 0; x; scale++) {
    let group = x % 1e3;
    if (group === 1 && scale === 1) {
      parts.unshift('seribu');
    } else if (group) {
      const chunk: string[] = group > 99
        ? [(group > 199 ? ONES[(group / 100) | 0] + ' ' : 'se') + 'ratus']
        : [];
      if ((group %= 100)) {
        if (group > 9 && group < 20)
          chunk.push(group < 11 ? 'sepuluh' : (group < 12 ? 'se' : ONES[group % 10] + ' ') + 'belas');
        else {
          if (group > 19) chunk.push(ONES[(group / 10) | 0] + ' puluh');
          if ((group %= 10)) chunk.push(ONES[group]);
        }
      }
      if (scale) chunk.push(SCALES[scale]);
      parts.unshift(chunk.join(' '));
    }
    x = Math.floor(x / 1e3);
  }

  return parts.join(' ');
}

export function indonesianToNumber(text: string): number | null {
  const normalized = text.trim().toLowerCase()
    .replace(/\bse(?=puluh|belas|ratus|ribu)/g, 'satu ');

  if (!normalized) return null;
  if (normalized === 'nol') return 0;

  let total = 0;
  let group = 0;
  let current = 0;

  for (const word of normalized.split(/\s+/)) {
    const digit = ONES.indexOf(word);
    if (digit > 0) {
      current = digit;
    } else if (word === 'belas') {
      group += current + 10;
      current = 0;
    } else if (word === 'puluh') {
      group += current * 10;
      current = 0;
    } else if (word === 'ratus') {
      group += current * 100;
      current = 0;
    } else if (word === 'ribu') {
      total += (group + current || 1) * 1_000;
      group = current = 0;
    } else if (word === 'juta') {
      total += (group + current || 1) * 1_000_000;
      group = current = 0;
    } else if (word === 'miliar') {
      total += (group + current || 1) * 1_000_000_000;
      group = current = 0;
    } else {
      return null;
    }
  }

  return total + group + current;
}
