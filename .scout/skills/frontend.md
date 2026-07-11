# Frontend Skill

## Purpose
Guide for building Next.js App Router frontend components and pages using shadcn/ui, Tailwind v4, and TypeScript.

## When to Use
- Creating or modifying React components in `components/`
- Adding or editing pages in `app/`
- Implementing UI with shadcn/ui primitives
- Styling with Tailwind utility classes
- Adding client-side interactivity

## Workflow
1. Identify if the component needs client interactivity → add `"use client"` directive
2. Place shared components in `components/`, pages in `app/`
3. Use shadcn/ui primitives from `@/components/ui/` before building custom
4. Style with Tailwind utility classes — inline styles only for dynamic runtime values
5. Use lucide-react for icons, import from `lucide-react`
6. Apply theme via CSS variables — `.dark` class toggles automatically
7. Mark client components with `"use client"` at the top of the file

## Checklist
- [ ] Component placed in correct directory (`components/` vs `app/`)
- [ ] `"use client"` added only when needed (hooks, event handlers, browser APIs)
- [ ] Tailwind utility classes used — no inline styles for static values
- [ ] shadcn/ui primitives reused before building custom
- [ ] Icons imported from lucide-react
- [ ] Dark mode tested via `.dark` class toggle
- [ ] TypeScript types defined (no `any`)

## Best Practices
- Prefer server components by default — only add `"use client"` when you need interactivity
- Compose shadcn/ui primitives rather than building from scratch
- Use Tailwind's `dark:` variant instead of manual class checks
- Keep components small — extract reusable pieces into `components/`
- Use Next.js `<Image>` for optimized images, not `<img>`

## Common Mistakes
- Adding `"use client"` to every component — server components are faster
- Inline styles for static values — use Tailwind classes
- Importing from wrong shadcn/ui path (should be `@/components/ui/`)
- Missing TypeScript types on props
- Forgetting to handle loading/error states in async client components

## Exit Criteria
- [ ] Component renders correctly in both light and dark themes
- [ ] No TypeScript errors
- [ ] Responsive at 375px+ viewport
- [ ] Console is free of errors and warnings
- [ ] All interactive elements have proper aria labels
