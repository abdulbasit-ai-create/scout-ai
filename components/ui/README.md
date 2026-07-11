# UI Primitives

Base UI components built with shadcn/ui patterns wrapping `@base-ui/react` primitives.

## Files

- `button.tsx` — CVA-based button with variants (default, outline, ghost, etc.)
- `input.tsx` — Styled input wrapping @base-ui/react input
- `progress.tsx` — Progress bar with Track, Indicator, Label, Value sub-components

## Usage

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
```

All primitives use `cn()` from `@/lib/utils/utils` for class merging.
