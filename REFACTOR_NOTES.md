# Refactor Notes

## Practice page duplication (numbers-to-words / words-to-numbers)

These two pages share a lot of structure. Once more practice types exist and
the patterns are clearer, extract a shared `PracticeShell.svelte` component.

### What's duplicated
- Layout: back link, centered container with h-[400px], `space-y-8`
- Game loop: `randomNumber()`, `next()`, `handleKeydown()`, state vars
- Button row: Check (disabled logic) + Next/Skip (emerald highlight on correct)
- Feedback area: correct message, error list
- Overlay technique: absolute div with z-10, transparent border, pointer-events-none

### What differs per practice
- Prompt display: content and text size (text-7xl number vs text-3xl words)
- Input: placeholder text, `inputmode` (numeric or not)
- Error highlighting: word-level overlay (buildOverlaySpans) vs digit-level overlay
- Result types: CheckResult (wrongIndices, warnings) vs NumberCheckResult (wrongDigits, no warnings)
- Submit: different check function calls

### Approach when ready
A `PracticeShell` component with snippets/slots for:
- prompt content (the thing being displayed)
- input area (with overlay, since highlighting differs)
- feedback content (since result shapes differ)

Shell handles: layout, back link, buttons, keyboard, next/skip logic.
