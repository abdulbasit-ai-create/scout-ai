# Deployment Skill

## Purpose
Guide for deploying Scout AI — build configuration, environment variables, Playwright browser binaries, and storage considerations.

## When to Use
- Setting up deployment pipeline
- Configuring production environment
- Debugging deployment issues
- Scaling to multiple instances

## Workflow
1. Set `NVIDIA_NIM_API_KEY` environment variable — required at runtime
2. Install Playwright browser binaries: `npx playwright install chromium`
3. Build with `next build` — outputs static + serverless functions
4. Ensure `public/screenshots/` directory exists and is writable
5. Verify rate limiting works (in-memory — resets on restart)
6. Test the deployed application end-to-end

## Checklist
- [ ] `NVIDIA_NIM_API_KEY` set in production environment
- [ ] Playwright chromium installed: `npx playwright install chromium`
- [ ] `public/screenshots/` directory exists and is writable
- [ ] Build succeeds: `next build`
- [ ] Rate limiting works (in-memory — resets on restart)
- [ ] Environment variables not hardcoded in source

## Best Practices
- Set `NVIDIA_NIM_API_KEY` as a server environment variable, never in code
- Install Playwright browser binaries in Dockerfile or build step
- Use Redis for rate limiting if deploying multiple instances
- Store screenshots on persistent volume or object storage
- Test the full flow after deployment, not just the build

## Common Mistakes
- Forgetting to install Playwright browser binaries on server
- Hardcoding `NVIDIA_NIM_API_KEY` in source code
- Assuming in-memory rate limiting works across multiple instances
- Not making `public/screenshots/` writable
- Not testing the full flow after deployment

## Exit Criteria
- [ ] `NVIDIA_NIM_API_KEY` set in production environment
- [ ] Playwright chromium installed on server
- [ ] `public/screenshots/` directory exists and is writable
- [ ] Build succeeds: `next build`
- [ ] Full flow tested after deployment
- [ ] Rate limiting works (Redis added if multi-instance)
