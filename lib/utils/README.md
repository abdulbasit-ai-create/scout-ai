# Utils Module

Shared utility functions used across the application.

## Files

- `utils.ts` — `cn()` helper combining `clsx` and `tailwind-merge` for conditional class merging

## Usage

```tsx
import { cn } from "@/lib/utils/utils"

<div className={cn("base-class", condition && "conditional-class")} />
```
