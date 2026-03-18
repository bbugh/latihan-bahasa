# Latihan Bahasa

Personal Indonesian language drilling app. Focused on things that benefit
from timed, repeated practice rather than flash cards — things with rules
and structure, not just vocabulary.

## Tech

- SvelteKit (Svelte 5)
- TypeScript
- Centralized progress store (`$state` in `.svelte.ts` module, persisted to localStorage)

## Phase 1: Numbers

A drill where the app shows a number and you type the Indonesian text, or
vice versa.

### Number conversion engine

Handles integer <-> Indonesian text conversion:

- 0: nol
- 1-10: satu, dua, tiga, empat, lima, enam, tujuh, delapan, sembilan, sepuluh
- 11: sebelas
- 12-19: dua belas, tiga belas, ...
- 20-99: dua puluh, dua puluh satu, ...
- 100: seratus (not "satu ratus")
- 101-999: seratus satu, dua ratus tiga puluh empat, ...
- 1,000: seribu (not "satu ribu")
- 1,001+: seribu satu, dua ribu tiga ratus, ...
- Up to at least 999,999,999 (miliar range)

### Drill modes

- **Number -> Text**: see `4,321`, type `empat ribu tiga ratus dua puluh satu`
- **Text -> Number**: see `empat ribu tiga ratus dua puluh satu`, type `4321`

### Progress tracking

Per-unit stats stored in centralized `$state` store, persisted to localStorage:

- Total attempts
- Correct answers
- Current streak
- Average response time (ms)
- Best streak

## Phase 2: Audio

- Use Web Speech API (`speechSynthesis`) with Indonesian voice to read
  numbers aloud
- Add a drill mode: hear the number, type it (either as digits or text)

## Future units

Each unit is a self-contained converter + drill config. Planned:

- Days of the week (hari Senin, Selasa, ...)
- Months (Januari, Februari, ...)
- Time / clock reading (jam tiga lewat seperempat, ...)
- Ordinal numbers (pertama, kedua, ketiga, ...)
- Dates (tanggal dua puluh Maret, ...)

## UI

Keep it simple:

- Prompt, text input, immediate feedback
- Stats summary visible during drilling (streak, accuracy)
