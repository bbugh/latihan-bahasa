# Live digit coloring as user types

## Context

The number drill shows a number like "844" and the user types the Indonesian words. Right now feedback only comes after submitting. We want the digits to turn green in real-time as the user correctly types the corresponding words, giving immediate positive reinforcement.

## Approach

### New function: `numberToSegments(n: number): Segment[]`

Returns the number broken into display segments, each mapped to its Indonesian words.

```ts
type Segment = { display: string, words: string[] }
```

Example for 844 → `"delapan ratus empat puluh empat"`:
- `{ display: "8", words: ["delapan", "ratus"] }`
- `{ display: "4", words: ["empat", "puluh"] }`
- `{ display: "4", words: ["empat"] }`

Example for 4,321 → `"empat ribu tiga ratus dua puluh satu"`:
- `{ display: "4,", words: ["empat", "ribu"] }`
- `{ display: "3", words: ["tiga", "ratus"] }`
- `{ display: "2", words: ["dua", "puluh"] }`
- `{ display: "1", words: ["satu"] }`

Teens are a single segment since they're one unit: 15 → `{ display: "15", words: ["lima", "belas"] }`

The function mirrors the decomposition logic of `numberToIndonesian` but tracks which digits each word group covers. Handle "se-" forms (seratus, seribu, etc.) as single words in their segment.

### New function: `countMatchedWords(expectedWords: string[], input: string): number`

Compares user's typed words left-to-right against expected words. Returns the count of consecutively matched words from the start. Handles case insensitivity and "se-" expansion (accepts "satu ratus" for "seratus").

The word currently being typed (incomplete) should NOT count as matched — only fully typed, space-separated words that match.

### UI changes in `+page.svelte`

Replace the plain number display with colored segments:
- Compute segments from `numberToSegments(number)`
- On each input change, compute `countMatchedWords(...)`
- Walk segments: if all of a segment's words fall within the matched count, color that segment's `display` green. Otherwise default color.
- Render each segment as a `<span>` with the appropriate color class

## Files to modify

1. `src/lib/numbers.ts` — add `Segment` type, `numberToSegments()`, `countMatchedWords()`
2. `src/lib/numbers.test.ts` — tests for both new functions (write first)
3. `src/routes/+page.svelte` — render segments with coloring

## Verification

- `pnpm test` passes
- `pnpm dev` — type correct words for a number and watch digits go green left-to-right
- Teens (11-19), "se-" forms (100, 1000), and zeros in the middle (101, 1001) all behave sensibly
