# Agent Work Summary

Date: 2026-05-29

## Scope

- Restored compact project context with `.\tools\agent-start.ps1`.
- Investigated free/non-paid vision-capable LLM options besides Gemini.
- Installed and tested an OpenRouter API key provided by the user.

## Findings

- `OPENROUTER_API_KEY` was not set initially.
- Public OpenRouter models API was reachable and listed free vision-capable models.
- Existing environment keys:
  - `GOOGLE_GENERATIVE_AI_API_KEY`: set.
  - `ANTHROPIC_API_KEY`: set.
  - `OPENROUTER_API_KEY`: installed during this session.
  - `MISTRAL_API_KEY`, `GROQ_API_KEY`, `HF_TOKEN`, `HUGGINGFACE_API_KEY`: not set.

## OpenRouter Free Vision Candidates

Live OpenRouter catalog check found free vision/text-output options including:

- `openrouter/free`
- `nvidia/nemotron-nano-12b-v2-vl:free`
- `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`
- `moonshotai/kimi-k2.6:free`
- Google Gemma/Gemma 4 free variants, though the user asked for non-Gemini alternatives.

## Checks Run

- Confirmed OpenRouter `/api/v1/models` works without an API key for catalog lookup.
- Confirmed OpenRouter chat without a key returns expected `401 Unauthorized`.
- Installed `OPENROUTER_API_KEY` into the User environment without printing the secret.
- Ran OpenRouter text smoke tests:
  - `openrouter/free`: OK.
  - `nvidia/nemotron-nano-12b-v2-vl:free`: OK.
  - `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`: OK.
  - `moonshotai/kimi-k2.6:free`: failed with upstream `429` rate limit.
- Ran OpenRouter vision smoke tests with a small red PNG data URL:
  - `openrouter/free`: OK.
  - `nvidia/nemotron-nano-12b-v2-vl:free`: OK, responded with red color.
  - `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`: OK.
- Checked Google generation:
  - `gemini-2.5-flash`: OK.
  - Some Gemini checks returned transient `429`/`503`.
- Checked Anthropic:
  - Models API: OK.
  - Messages API: failed because credit balance is too low.

## Current Recommendation

- Best non-Gemini free vision candidate for OpenCode: `nvidia/nemotron-nano-12b-v2-vl:free` via OpenRouter.
- Good fallback: `openrouter/free`.
- Avoid relying on `moonshotai/kimi-k2.6:free` for now because it hit upstream rate limiting during smoke tests.

## Next Steps

- Add an OpenRouter provider to `opencode.json` and `.opencode/opencode.json`.
- Add `vision/openrouter-free` and/or `vision/nemotron` selector entries.
- Update `.opencode/plugins/vision-router.js` to route those selectors to OpenRouter models.
- Re-run text and image smoke tests after config changes.
