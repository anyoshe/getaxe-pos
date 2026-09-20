# Business Advisor

Floating chat on dashboard + POS.

## Providers (order)

1. **xAI Grok** — `XAI_API_KEY` or `GROK_API_KEY` (optional `XAI_MODEL` / `GROK_MODEL`, default `grok-3-mini`)
2. **Groq** — `GROQ_API_KEY` (optional `GROQ_MODEL`, default `llama-3.1-8b-instant`)
3. **Heuristic** — no key; narrative advice from live GetAxe numbers

## Vercel / `.env`

```env
# xAI (Grok) — https://console.x.ai
XAI_API_KEY=xai-...
XAI_MODEL=grok-3-mini

# OR same key under this name:
# GROK_API_KEY=xai-...

# Optional free alternative:
# GROQ_API_KEY=gsk_...
# GROQ_MODEL=llama-3.1-8b-instant
```

Redeploy after setting env vars. If the UI still shows "On-device coach", the LLM call failed (wrong key name, invalid key, or model) and fell back.
