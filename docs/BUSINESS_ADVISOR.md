# Business Advisor (AI coach)

Floating chat on every authenticated screen (AppShell).

## Providers

1. **Heuristic (default, free)** — answers from live dashboard/profit/stock/AR/AP numbers. No API key.
2. **Groq (optional, free tier)** — set `GROQ_API_KEY` in Vercel/env. Model default `llama-3.1-8b-instant`.

## Limits

15 messages per business per UTC day (in-memory). Raise or bill later for paid plans.

## Env

```
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant
```
