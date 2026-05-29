# Agent Work Summary

Date: 2026-05-29

## Scope

- Cleaned up broken OpenCode vision routing after the Mistral vision plugin
  caused bad behavior and extra model/agent entries.
- Reduced the setup back to a simple working shape: `Loom` + DeepSeek for normal
  work, NVIDIA Nemotron for image analysis through the router, and Gemini as a
  fallback.

## Main Changes

- Removed the Mistral vision path:
  - deleted `.opencode/plugins/mistral-vision-agent.js`
  - removed stale native
    `C:\Users\Fil-Dom\.config\opencode\plugin\mistral-vision-agent.js`
  - removed `vision/mistral` and Mistral plugin references from active configs
- Removed extra orchestration noise from active config:
  - removed `@opencode_weave/weave` from active project/native plugin lists
  - removed `oh-my-opencode-slim` from the native plugin list
  - deleted stale `.opencode/weave-opencode.jsonc`
- Simplified active OpenCode config copies:
  - `opencode.json`
  - `.opencode/opencode.json`
  - `C:\Users\Fil-Dom\.config\opencode\opencode.jsonc`
- Kept the active agent surface minimal:
  - `loom` as the default primary agent
  - `screenshot` as the internal visual subagent
  - disabled default/noisy `explore`, `general`, `plan`, `build`, and
    `orchestrator` agents in config
- Switched OpenRouter from `@ai-sdk/openai` to
  `@ai-sdk/openai-compatible` to avoid OpenAI Responses API incompatibility.
- Installed `@ai-sdk/openai-compatible@^2.0.48` in both project and native
  OpenCode runtime folders.
- Updated `.opencode/plugins/vision-router.js` and synced it to the native
  runtime plugin folder.

## Current Runtime Shape

- Normal model shown in UI:
  - Agent: `Loom`
  - Model: `DeepSeek V4 Pro`
- Image flow:
  - `vision-router.js` intercepts image turns.
  - It calls OpenRouter directly through `/chat/completions` using
    `nvidia/nemotron-nano-12b-v2-vl:free`.
  - It replaces image attachments with internal visual-context text.
  - It returns the final call to `deepseek/deepseek-v4-pro`.
- Gemini remains configured as fallback for vision failures/PDF-style fallback
  behavior.

## Checks Run

- Parsed project and native OpenCode JSON configs successfully.
- Ran `node --check` on project and native `vision-router.js`.
- Confirmed native config no longer references:
  - Mistral
  - `@opencode_weave/weave`
  - `oh-my-opencode-slim`
  - extra OpenRouter/free/omni/OpenAI/Claude/gateway vision entries
- Confirmed native Mistral plugin file is gone.
- Ran live router smoke checks with a tiny PNG:
  - `loom` + DeepSeek + image routes through OpenRouter NVIDIA and returns to
    DeepSeek with text-only visual context.
  - direct `screenshot` + OpenRouter NVIDIA + image follows the same safe path.

## User-Facing Status

- The OpenCode UI should show `Loom` and `DeepSeek V4 Pro` for normal work.
- NVIDIA/Nemotron does not need to appear in the bottom model selector for
  normal text turns; it is used internally by the router when an image is
  attached.
- If OpenCode Desktop was already open, it must be fully closed and reopened so
  the UI stops using cached old plugin/agent state.

## Files Touched

- `opencode.json`
- `.opencode/opencode.json`
- `.opencode/plugins/vision-router.js`
- `.opencode/weave-opencode.jsonc` deleted
- `.opencode/package.json`
- `.opencode/package-lock.json`
- `tools/project-memory/pending-tasks.md`
- `tools/project-memory/opencode-vision-routing.md`
- native app config/plugin/dependencies under
  `C:\Users\Fil-Dom\.config\opencode`

## Remaining Notes

- Native `package.json` still has token/deepseek helper plugins installed:
  `opencode-deepseek-thinking-fix`, `opencode-token-tracker`, and
  `@ramtinj95/opencode-tokenscope`; these were preserved because they do not add
  the unwanted agent dropdown entries.
- The git worktree has broader existing dirty state from earlier instruction-kit
  work; do not assume all dirty files belong only to this change.
