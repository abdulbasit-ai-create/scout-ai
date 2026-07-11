# Architecture Skill

## Purpose
Guide for making architecture decisions consistent with Scout AI's layered design: routes → components → lib utilities → external APIs.

## When to Use
- Designing new features or data flows
- Deciding where to place new code
- Evaluating caching, rate limiting, or storage strategies
- Reviewing architecture decisions

## Workflow
1. Identify which layer the change belongs to: route, component, lib utility, or external API
2. Trace the data flow end-to-end before writing code
3. Apply rate limits: 5/min for capture, 15/min for analyze
4. Apply caching: 1h server-side TTL for AI responses, sessionStorage for capture data
5. Store capture results in sessionStorage — cleared when tab closes
6. Store analysis history in localStorage — persists across sessions
7. Verify the change doesn't break the existing data flow

## Data Flow Reference
```
URL input → capture API (Playwright) → sessionStorage → report page → analyze API (NVIDIA NIM) → localStorage history
```

## Checklist
- [ ] Change placed in correct layer (route, component, lib, external)
- [ ] Data flow traced end-to-end — no broken links
- [ ] Rate limits respected: 5/min capture, 15/min analyze
- [ ] Cache applied: 1h TTL for AI responses, sessionStorage for capture
- [ ] No circular dependencies between layers
- [ ] sessionStorage used for per-session data only
- [ ] localStorage used for persistent history only

## Best Practices
- Routes call lib utilities — lib utilities call external APIs, never the reverse
- Components read from storage — they never write directly to external APIs
- Cache AI responses for 1h to avoid redundant NVIDIA NIM calls
- sessionStorage for ephemeral capture data, localStorage for persistent history
- Rate limits are per-endpoint — track them independently

## Common Mistakes
- Components calling external APIs directly instead of going through routes
- Storing persistent data in sessionStorage (cleared on tab close)
- Storing ephemeral data in localStorage (never cleaned up)
- Not caching AI responses — hitting NVIDIA NIM on every page load
- Ignoring rate limits in data flow design

## Exit Criteria
- [ ] Data flow traced end-to-end and documented
- [ ] Rate limits respected: 5/min capture, 15/min analyze
- [ ] Cache strategy defined: 1h AI responses, sessionStorage capture
- [ ] Layers respected: routes → components → lib → external APIs
- [ ] No circular dependencies between layers
