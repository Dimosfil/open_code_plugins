# Pending Tasks

Use this file for active project-wide plans and multi-step work.

Keep entries concise and task-relevant. Do not store full diffs, large logs,
generated outputs, secrets, credentials, or private production data.

## Status Markers

- `[ ]` not started
- `[~]` in progress
- `[x]` done
- `[!]` blocked or needs attention

## Tasks

### 2026-05-24 Route OpenCode Images Through Gemini Vision

Goal: keep DeepSeek V4 Pro as the OpenCode orchestrator while routing screenshots/images to the Gemini screenshot subagent for visual extraction.

Execution order:

- [x] Set OpenCode's primary model back to DeepSeek in root and `.opencode` configs.
- [x] Keep Gemini as the dedicated screenshot/image subagent.
- [x] Add explicit orchestration instructions so image inputs are extracted by the subagent before DeepSeek makes the final decision.
- [x] Add a pre-model vision router hook so DeepSeek image turns are routed to Gemini before the provider rejects attachments.
- [x] Smoke-check JSON/config syntax and verify an attached PNG routes to Gemini instead of failing on DeepSeek image input.

### 2026-05-24 Add Gemini Vision To OpenCode Orchestrator

Goal: add Google Gemini API as an image-capable OpenCode provider and route image/orchestrator workers through it without storing secrets in tracked files.

Execution order:

- [x] Add a Gemini provider/model to root and `.opencode` OpenCode configs.
- [x] Add a Gemini-capable Weave worker mapping for image-heavy agents.
- [x] Install local provider dependency and set the API key in the user environment.
- [x] Smoke-check config/dependency loading and Gemini model availability without storing secrets in tracked files.

### 2026-05-24 Configure Global OpenCode Slim Orchestration

Goal: align the user's global OpenCode config with the provided slim specialist orchestration.

Execution order:

- [x] Inspect existing global OpenCode config files.
- [x] Write `opencode.jsonc`, `oh-my-opencode-slim.json`, and `tui.json`.
- [x] Smoke-check JSON/JSONC parsing and OpenCode config loading where possible.

### 2026-05-22 Add OpenCode Vision And Image Generation

Goal: make this OpenCode workspace handle screenshot/image analysis and image generation through an image-capable LLM/tool integration.

Execution order:

- [x] Verify current OpenCode image attachment and plugin support.
- [x] Configure OpenCode/Weave with an image-capable model while keeping DeepSeek available where useful.
- [x] Add a local image generation plugin/tool.
- [x] Smoke-check config, plugin import, and OpenCode agent/tool loading.

### 2026-05-22 Configure OpenCode Orchestrator

Goal: make the local OpenCode workspace load the Weave orchestration plugin.

Execution order:

- [x] Inspect existing OpenCode and Weave config files.
- [x] Install or repair the local Weave plugin dependency under `.opencode`.
- [x] Align root and `.opencode` configs so OpenCode can load the orchestrator.
- [x] Smoke-check the setup without exposing auth or private app data.

### 2026-05-22 Fix OpenCode Desktop Local Server

Goal: repair the updated OpenCode Desktop install so it can connect to its Local Server.

Execution order:

- [~] Verify installed Desktop/CLI versions and whether the CLI/server can start.
- [ ] Repair the CLI/Desktop linkage or PATH issue that blocks Local Server startup.
- [ ] Launch or smoke-check OpenCode after repair.

### 2026-05-22 Repair OpenCode CLI

Goal: install or repair the terminal `opencode` CLI for this Windows workspace.

Execution order:

- [x] Verify current `opencode`, Node.js, npm, and npm global prefix state.
- [x] Install or repair the OpenCode CLI using the official npm package when needed.
- [x] Verify `opencode --version` and record the result.

### 2026-05-22 OpenCode Installed App Link Map

Goal: Find local Windows links and integration points for `C:\Users\Fil-Dom\AppData\Local\Programs\@opencode-aidesktop\OpenCode.exe`.

Execution order:

- [x] Inspect the target executable, install directory, and nearby manifests.
- [x] Check running processes, shortcuts, uninstall entries, startup entries, PATH/commands, firewall/tasks where practical.
- [x] Summarize findings without exposing secrets or dumping large files.

### TODO Task Name

Goal: TODO

Planned changes:

- [ ] TODO

Execution order:

- [ ] TODO

Risks or dependencies:

- [ ] TODO

Verification:

- [ ] TODO
