# ADR-002: Use NVIDIA NIM API for AI Analysis

**Status:** Accepted  
**Date:** 2026-07-11  
**Tags:** ai, llm, analysis, nvidia

## Context

Scout AI needs to generate structured intelligence reports from captured website data. Requirements:

- Process structured input (metadata, security headers, technologies, metrics)
- Produce structured JSON output with specific fields (executive summary, strengths, weaknesses, etc.)
- Low latency — report should generate in under 5 seconds
- No paid API key — project operates with zero budget for external services
- Reliable inference with consistent JSON formatting

The LLM must reason over factual data and return a valid JSON object every time, without inventing information.

## Decision

Use **NVIDIA NIM API** with the `meta/llama-3.1-8b-instruct` model.

```
POST https://integrate.api.nvidia.com/v1/chat/completions
Headers:
  Authorization: Bearer {NVIDIA_NIM_API_KEY}
  Content-Type: application/json
Body:
  model: "meta/llama-3.1-8b-instruct"
  messages:
    - role: "system" → Scout AI system prompt (strict rules, JSON schema)
    - role: "user" → Captured website data formatted as structured text
  temperature: 0.1
  max_tokens: 2048
```

Key configuration:
- **Temperature: 0.1** — Low randomness for deterministic, consistent output
- **Max tokens: 2048** — Sufficient for the report schema
- **System prompt** — Strict rules: never invent data, reference actual values, output valid JSON
- **Prompt engineering** — All captured data is formatted into structured sections (PAGE INFORMATION, PERFORMANCE METRICS, SECURITY FINDINGS, SEO FINDINGS, DETECTED TECHNOLOGIES)

## Consequences

### Positive
- **Free tier**: No paid API key required — project can run without billing
- **Easy setup**: Single API key in `.env.local`, standard OpenAI-compatible API format
- **Fast inference**: 8B model generates reports in 1-3 seconds
- **Good enough quality**: For the structured, data-driven task, 8B parameters is sufficient
- **JSON reliability**: Low temperature + strict system prompt produces parseable output

### Negative
- **Requires internet**: API call fails without network connectivity
- **8B model ceiling**: Less capable than 70B+ models for nuanced analysis; may miss subtle inferences
- **Rate limits**: NVIDIA NIM has its own rate limits (though generous on free tier)
- **Dependency**: Service availability depends on NVIDIA's API uptime
- **No offline mode**: Cannot generate reports during outages

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| **OpenAI GPT-4** | Paid API — $0.01-0.03 per report, requires billing |
| **Google Gemini** | Free tier has low rate limits (60 requests/minute total), less reliable JSON formatting |
| **Local LLM (Ollama/LM Studio)** | Requires GPU or significant CPU resources; adds deployment complexity; inconsistent JSON output |
| **Claude API (Anthropic)** | Paid API — no free tier |
| **Groq API** | Fast but free tier is limited; less mature ecosystem |

NVIDIA NIM was chosen because it offers the best balance of speed, reliability, cost (free), and ease of integration for this specific structured-report use case.
