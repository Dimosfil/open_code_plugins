# Agent Work Summary

Date: 2026-05-29

## Scope

- Ran compact `ги старт` restore for `D:\AI\open_code_plugins`.
- Applied `ги апдейт` for the copied `general-instructions` instruction kit.
- Investigated and added Claude Haiku as an OpenCode vision selector in the same style as existing Gemini vision routing.
- Checked `ANTHROPIC_API_KEY` without printing the secret.

## Changes Made

Instruction kit update:

- Updated copied local instructions from `2026.05.27.1` to `2026.05.28.5`.
- Recorded 9 applied migrations in `tools/project-memory/instruction-kit.json`.
- Added unified project-language guidance and `tools/select-project-language.ps1`.
- Added encoding-safety, config-service, reboot, scoped start/update, and update-intake ownership rules.
- Added `tools/project-memory/build_project_memory_index.py` and README guidance for the generated SQLite memory index.

Claude Haiku vision:

- Added `vision/claude-haiku` selector in `opencode.json` and `.opencode/opencode.json`.
- Added `anthropic/claude-haiku-4-5` provider/model entries using `@ai-sdk/anthropic`.
- Installed `@ai-sdk/anthropic@3.0.81` into the local `.opencode` Node environment.
- Updated `.opencode/plugins/vision-router.js` so image and PDF turns selected as `vision/claude-haiku` route to `anthropic/claude-haiku-4-5`.
- Updated `tools/project-memory/opencode-vision-routing.md` with the new routing note.
- Updated `tools/project-memory/pending-tasks.md` with completed task checklist.

## Checks Run

- Parsed OpenCode JSON config copies with PowerShell `ConvertFrom-Json`.
- Parsed PowerShell scripts with `[scriptblock]::Create`.
- Ran `node --check` for `.opencode/plugins/vision-router.js` and `.opencode/plugins/mistral-vision-agent.js`.
- Ran `npm ls @ai-sdk/anthropic --depth=0` in `.opencode`.
- Mock-tested `VisionRouter`:
  - image attachment with `vision/claude-haiku` routes to `anthropic/claude-haiku-4-5`.
  - PDF attachment with `vision/claude-haiku` routes to `anthropic/claude-haiku-4-5`.
- Rebuilt project memory SQLite index with `python .\tools\project-memory\build_project_memory_index.py rebuild`.
- Checked index stats with `python .\tools\project-memory\build_project_memory_index.py stats`.
- Ran `git diff --check`.
- Ran `.\tools\check-instruction-kit-updates.ps1`; no pending migrations remain.
- Ran `.\tools\agent-start.ps1 -MaxLines 20`.

## Current State

- Branch: `main`
- Upstream: `origin/main`
- Ahead/behind at last check: `0/0`
- Worktree is dirty. Some changes existed before this session and some were created during this session.
- Automatic commit/push was not performed because dirty pre-existing changes make scoped commit selection ambiguous.

Current notable dirty/untracked paths include:

- `.opencode/opencode.json`
- `.opencode/plugins/vision-router.js`
- `.opencode/plugins/mistral-vision-agent.js`
- `opencode.json`
- `AGENTS.md`
- `tools/AGENT_WORKING_AGREEMENTS.md`
- `tools/agent-start.ps1`
- `tools/select-project-language.ps1`
- `tools/project-memory/build_project_memory_index.py`
- `tools/project-memory/instruction-kit.json`
- `tools/project-memory/opencode-vision-routing.md`
- `tools/project-memory/pending-tasks.md`
- `tools/project-memory/system-preferences.json`
- `tools/project-memory/task-managers.json`

## Anthropic API Check

- `ANTHROPIC_API_KEY` is set in User environment.
- The key was masked in output; the secret was not printed.
- Anthropic `/v1/models` call succeeds and lists `claude-haiku-4-5-20251001`.
- A small `/v1/messages` smoke call failed with:
  `Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.`

Interpretation: auth and model access discovery work, but the account needs Anthropic API credits/billing before OpenCode can use `vision/claude-haiku`.

## Next Steps

- Add Anthropic API credits in Console Billing if `vision/claude-haiku` should be used live.
- Fully restart OpenCode Desktop after setting or changing `ANTHROPIC_API_KEY`.
- If committing, decide whether to commit all current dirty changes or provide an explicit scoped file list because this session touched files that were already dirty.
