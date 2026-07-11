# Library

Business logic and utility modules organized by domain.

## Structure

```
lib/
├── analysis/     — Analytics tracking (localStorage-based)
├── capture/      — Capture utilities (reserved for future route extraction)
├── performance/  — Performance modules (reserved)
├── security/     — Security utilities (rate limiter)
├── seo/          — SEO utilities (reserved)
└── utils/        — Shared utilities (cn() helper)
```

## Conventions

- Pure functions preferred; side effects isolated to specific modules
- No external API calls — those belong in `app/api/` route handlers
- Browser storage access wrapped in try/catch for silent failure
- All exports are named exports (no default exports in lib)
