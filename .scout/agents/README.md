# Agent Definitions

Specialized AI agent personas for different engineering roles in this codebase.

## Agents

| Agent | Role |
|---|---|
| `frontend-agent` | Next.js App Router, Tailwind, shadcn/ui, React |
| `backend-agent` | API routes, Playwright, Wappalyzer, NVIDIA NIM |
| `review-agent` | Full-stack code review (quality, security, perf, a11y) |
| `architect-agent` | Architecture decisions, data flow, scalability |
| `performance-agent` | Profiling, caching, bundle optimization |
| `security-agent` | Vulnerability identification, SSRF, rate limiting |
| `testing-agent` | Playwright E2E testing, coverage, reliability |
| `release-agent` | Versioning, changelog, deployment coordination |

Each agent defines: Role, Responsibilities, Scope, Must-Never-Change guards, and Verification checklist.
