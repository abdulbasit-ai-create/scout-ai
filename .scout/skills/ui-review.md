# UI Review Skill

## Purpose
Systematic review of UI code for responsiveness, accessibility, theme consistency, and error-free rendering.

## When to Use
- Before merging any frontend PR
- After adding new components or pages
- When fixing UI bugs or layout issues
- Before deployment to production

## Workflow
1. Open the page at 375px viewport — verify no horizontal scroll, all content readable
2. Toggle dark/light theme — verify contrast, colors, and readability in both
3. Check accessibility: aria labels, roles, keyboard navigation, focus indicators
4. Verify print styles — `@media print` hides nav, shows content cleanly
5. Check touch targets are 44px minimum on interactive elements
6. Test loading, empty, and error states for every data-dependent component
7. Open browser console — verify zero errors or warnings

## Checklist
- [ ] Responsive at 375px+ — no horizontal scroll, content not cut off
- [ ] Dark and light theme both readable — sufficient contrast
- [ ] Aria labels on all interactive elements
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Print styles hide nav/sidebar, show main content
- [ ] Touch targets at least 44px
- [ ] Loading, empty, and error states render correctly
- [ ] Console has zero errors and zero warnings

## Best Practices
- Test mobile-first — 375px before desktop
- Use browser DevTools to simulate dark mode and reduced motion
- Verify keyboard tab order matches visual order
- Test with a screen reader for critical flows
- Check console after every interaction

## Common Mistakes
- Only testing at desktop widths
- Forgetting to check dark mode contrast
- Missing aria labels on icon-only buttons
- Ignoring console warnings about accessibility
- Not testing keyboard navigation end-to-end

## Exit Criteria
- [ ] No horizontal scroll at 375px viewport
- [ ] Dark and light themes both readable with sufficient contrast
- [ ] All interactive elements have aria labels and are keyboard-navigable
- [ ] Focus indicators visible on all interactive elements
- [ ] Print styles hide navigation, show main content
- [ ] Touch targets are 44px minimum
- [ ] Loading, empty, and error states render correctly
- [ ] Console has zero errors and zero warnings
