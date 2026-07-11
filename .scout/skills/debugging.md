# Debugging Skill

## Purpose
Systematic approach to debugging issues in Scout AI — from console errors to API responses to storage state.

## When to Use
- Any unexpected behavior in the application
- API routes returning errors
- UI not rendering correctly
- Tests failing unexpectedly
- Rate limit issues

## Workflow
1. Check browser console for errors — fix the first error, re-test
2. Check API response status and body in Network tab
3. Check `localStorage` and `sessionStorage` state in DevTools Application tab
4. Check rate limit counters — may be exhausted from previous tests
5. Check Playwright browser context if testing — headless mode has limitations
6. Isolate the issue: is it in the route, the component, or the external API?

## Common Issues Reference
- **Rate limits exhausted**: Wait 1 minute or restart the server
- **sessionStorage cleared**: Navigation or tab close clears it — re-capture
- **Clipboard API fails in headless**: Grant permissions or mock
- **Theme hydration mismatch**: Server-rendered HTML doesn't match client — use `suppressHydrationWarning`
- **Playwright browser context stale**: Create a new context for each test

## Checklist
- [ ] Console errors checked first
- [ ] API response status and body checked
- [ ] localStorage/sessionStorage state inspected
- [ ] Rate limit counters checked
- [ ] Playwright browser context checked (if testing)
- [ ] Theme hydration mismatch ruled out

## Best Practices
- Start with the console — it usually points to the exact error
- Check API responses before debugging UI — the data may be wrong
- sessionStorage is cleared on navigation — re-capture if data is missing
- Rate limits reset on server restart — restart if stuck
- Isolate the layer: route, component, or external API

## Common Mistakes
- Debugging UI before checking API response
- Not checking rate limit counters — assuming the API is broken
- Not realizing sessionStorage is cleared by navigation
- Debugging theme issues without checking for hydration mismatch
- Assuming headless Playwright has clipboard API access

## Exit Criteria
- [ ] Root cause identified (console, API, storage, or rate limit)
- [ ] Fix applied and verified
- [ ] No console errors after fix
- [ ] API responses return expected status and shape
- [ ] Storage state is correct
