# Security Skill

## Purpose
Guide for security review of Scout AI — private IP blocking, rate limiting, API key protection, and XSS prevention.

## When to Use
- Before production deployment
- When adding new API endpoints
- When handling user input
- When storing data in localStorage
- When adding new dependencies

## Workflow
1. Verify capture API blocks private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.0.0.1)
2. Verify rate limiting on all POST endpoints (capture, analyze)
3. Confirm `NVIDIA_NIM_API_KEY` is in environment variables only — never in source
4. Check for `dangerouslySetInnerHTML` usage — verify it's sanitized
5. Verify no sensitive data in localStorage (API keys, tokens, PII)
6. Search for `eval`, `new Function`, `Function()` — reject all
7. Run `npm audit` for dependency vulnerabilities

## Checklist
- [ ] Capture API blocks private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.0.0.1)
- [ ] Rate limiting on all POST endpoints
- [ ] `NVIDIA_NIM_API_KEY` in env var only — not in source code
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No sensitive data in localStorage (API keys, tokens, PII)
- [ ] No `eval`, `new Function`, or `Function()` constructor
- [ ] `npm audit` run — no high/critical vulnerabilities

## Best Practices
- Block private IPs in capture API to prevent SSRF
- Rate limit every POST endpoint — capture (5/min) and analyze (15/min)
- Keep API keys in environment variables — never in source or localStorage
- React handles XSS — but verify any `dangerouslySetInnerHTML` usage
- Run `npm audit` before every production deployment

## Common Mistakes
- Not blocking private IPs in capture API — SSRF vulnerability
- Rate limiting only some POST endpoints
- Hardcoding API keys in source code
- Using `dangerouslySetInnerHTML` without sanitization
- Storing sensitive data in localStorage (accessible via JS)

## Exit Criteria
- [ ] Private IP ranges blocked in capture API
- [ ] Rate limiting on all POST endpoints
- [ ] `NVIDIA_NIM_API_KEY` in env var only — not in source
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No sensitive data in localStorage
- [ ] No `eval` or `Function` constructor in codebase
- [ ] `npm audit` shows no high/critical vulnerabilities
