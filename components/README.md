# Components

Feature-grouped React components for the Scout AI application.

## Structure

```
components/
├── ui/          — Primitive UI components (shadcn/ui + @base-ui/react)
├── landing/     — Landing page components (hero, features, how-it-works, analysis loading)
├── report/      — Report page components (report history)
└── layout/      — Layout components (header, footer, theme toggle)
```

## Conventions

- Server components by default; add `"use client"` only for interactivity
- Use `@/components/ui/` primitives before building custom components
- Style with Tailwind utility classes; use `cn()` from `@/lib/utils/utils` for merging
- Import icons from `lucide-react` (tree-shakeable)
- TypeScript strict — no `any`, explicit prop interfaces
