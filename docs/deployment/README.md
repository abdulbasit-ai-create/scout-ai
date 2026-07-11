# Deployment Guide

## Prerequisites

- **Node.js 20+**
- **NVIDIA NIM API Key** — `NVIDIA_NIM_API_KEY` environment variable
- **Playwright Chromium** — Required for website capture

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NVIDIA_NIM_API_KEY` | Yes | NVIDIA NIM API key for AI analysis |

## Platform Guides

### Vercel

1. Push repository to GitHub
2. Import project in Vercel dashboard
3. Set environment variable: `NVIDIA_NIM_API_KEY`
4. Build command: `npx next build` (omit `--webpack` on Linux/macOS)
5. Install Playwright: add to `vercel.json`:
   ```json
   {
     "build": {
       "command": "npx playwright install chromium && next build"
     }
   }
   ```
6. Deploy

### Docker

```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NVIDIA_NIM_API_KEY=nvapi-...
RUN npx playwright install chromium
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual (Linux)

```bash
# Install system dependencies for Playwright
npx playwright install-deps chromium

# Build
npm run build

# Start
npm start
```

## Build Verification

```bash
npm run build    # Should complete with 0 errors
npm run lint     # Should pass with 0 warnings
npm run type-check  # Should pass with 0 errors
```

## Notes

- **Rate limiter** is in-memory — resets on server restart. Use Redis for multi-instance
- **AI cache** is in-memory (1h TTL) — resets on restart, also per-instance
- **Screenshots** stored on filesystem at `public/screenshots/` — configure external storage for scale
- **Win32 note**: requires `--webpack` flag due to SWC binary incompatibility
