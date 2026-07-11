# Performance Skill

## Purpose
Guide for optimizing Scout AI performance — minimizing Playwright launches, caching AI responses, and reducing unnecessary work.

## When to Use
- Application feels slow
- Playwright launches are too frequent
- AI API calls are redundant
- UI interactions are laggy
- Screenshot files are too large
- Before production deployment

## Workflow
1. Reuse Playwright browser contexts — avoid launching for every request
2. Cache AI responses with 1h TTL — check cache before calling NVIDIA NIM
3. Limit localStorage/sessionStorage reads and writes — batch where possible
4. Debounce UI interactions (search, filter, resize) — 300ms delay
5. Lazy-load heavy components with `next/dynamic`
6. Optimize screenshot files — compress or resize before storing
7. Run bundle analysis with `@next/bundle-analyzer`

## Checklist
- [ ] Playwright browser contexts reused — not launched per request
- [ ] AI responses cached with 1h TTL
- [ ] localStorage/sessionStorage reads/writes minimized
- [ ] UI interactions debounced (300ms)
- [ ] Heavy components lazy-loaded with `next/dynamic`
- [ ] Screenshot files optimized (compressed/resized)
- [ ] Bundle analysis run with `@next/bundle-analyzer`

## Best Practices
- Reuse Playwright browser contexts across requests — launching is expensive
- Cache AI responses for 1h to avoid redundant API calls
- Debounce UI interactions to reduce re-renders
- Lazy-load components that aren't visible on first paint
- Run bundle analysis before major releases

## Common Mistakes
- Launching a new Playwright browser for every capture request
- Not caching AI responses — hitting NVIDIA NIM on every page load
- Reading/writing localStorage on every render
- Not debouncing search or filter inputs
- Loading heavy components eagerly when they're below the fold

## Exit Criteria
- [ ] Playwright browser contexts reused across requests
- [ ] AI responses cached with 1h TTL
- [ ] localStorage/sessionStorage reads/writes minimized
- [ ] UI interactions debounced (300ms)
- [ ] Heavy components lazy-loaded
- [ ] Screenshot files optimized
- [ ] Bundle analysis run
