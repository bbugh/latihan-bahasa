/** Map wrong word indices to character ranges for input highlighting. */
export function wordErrorHighlightRanges(input: string, wrongIndices: number[]): [number, number][] {
  if (wrongIndices.length === 0) return [];
  const wrongSet = new Set(wrongIndices);
  const ranges: [number, number][] = [];
  let wordIndex = 0;
  let i = 0;
  while (i < input.length) {
    if (input[i] === ' ') {
      i++;
    } else {
      const start = i;
      while (i < input.length && input[i] !== ' ') i++;
      if (wrongSet.has(wordIndex)) ranges.push([start, i]);
      wordIndex++;
    }
  }
  return ranges;
}

/** Map wrong digit positions to character ranges for input highlighting. */
export function digitErrorHighlightRanges(wrongDigits: { position: number }[]): [number, number][] {
  return wrongDigits.map(d => [d.position, d.position + 1]);
}
