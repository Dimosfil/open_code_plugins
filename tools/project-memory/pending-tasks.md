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

### 2026-05-29 Fix OpenCode Vision Context Leakage

Goal: stop pasted/image-only turns from either being rejected as unsupported or
leaking internal vision-router context into the final DeepSeek answer.

Execution order:

- [x] Inspect the current router/config against the screenshot evidence.
- [x] Patch the router and agent prompt so image OCR is passed as user-facing
      evidence, not as internal routing text.
- [x] Advertise image attachment capability for the DeepSeek-facing route so
      image-only turns can reach the hook.
- [x] Sync project/native config/plugin copies and run syntax/smoke checks.

### 2026-05-29 Revert Mistral Vision Path To NVIDIA

Goal: remove the breaking Mistral vision preflight and make the Gemini-style
screenshot/vision path use NVIDIA Nemotron through OpenRouter.

Execution order:

- [x] Remove the Mistral selector/plugin from active OpenCode config.
- [x] Point screenshot and Weave visual agents at NVIDIA Nemotron.
- [x] Smoke-check JSON/plugin syntax and record the routing update.

### 2026-05-29 Simplify OpenCode Agents And NVIDIA Route

Goal: reduce OpenCode back to a minimal DeepSeek + screenshot + vision-router
setup and fix NVIDIA/OpenRouter calls so they do not hit the invalid Responses
API path.

Execution order:

- [x] Replace broad provider/agent config with the minimal working set.
- [x] Remove agent-generating plugins from project and native plugin lists.
- [x] Install/use the OpenAI-compatible provider for OpenRouter.
- [x] Smoke-check configs, router behavior, and native sync.

### 2026-05-29 Fix Pasted Image Attachment Routing

Goal: make pasted or dragged screenshots route through `vision-router.js` even
when OpenCode uses a nested `image_url`/attachment payload shape, and avoid
silent raw-image fallback to DeepSeek.

Execution order:

- [x] Restore compact context and inspect the current router/config.
- [x] Broaden image attachment detection and URL extraction.
- [x] Replace silent OpenRouter failure fallback with text-only diagnostic context.
- [x] Smoke-check simulated pasted-image payloads and sync the native plugin copy.
- [x] Add explicit `server` export and a final message-transform hook for
      real OpenCode Desktop pasted-image turns.

### 2026-05-29 Fix Native OpenCode Image Empty Input

Goal: stop image-only or caption-light OpenCode turns from failing with `input cannot be empty` after native app sync.

Execution order:

- [x] Inspect the active native/project vision plugins for empty-text handling.
- [x] Patch the project plugin copy and sync the native app plugin copy.
- [x] Smoke-check plugin syntax and a simulated image-only hook payload.

### 2026-05-29 Sync OpenRouter Vision Config To OpenCode App

Goal: apply the project OpenCode config and vision plugins to the native OpenCode Desktop runtime.

Execution order:

- [x] Confirm the native OpenCode config/plugin paths.
- [x] Copy the updated config and plugin files into the native runtime folder.
- [x] Smoke-check native config/plugin syntax after sync.

### 2026-05-29 Add OpenRouter Free Vision Selector

Goal: add non-Gemini free OpenRouter vision backends as selectable OpenCode vision models.

Execution order:

- [x] Add/update the local task checklist before editing code.
- [x] Add OpenRouter provider/model entries to both OpenCode config copies.
- [x] Teach `vision-router.js` to route `vision/openrouter-free` and `vision/nemotron`.
- [x] Add the second working Nemotron Omni free selector from prior smoke evidence.
- [x] Smoke-check JSON/plugin syntax and update vision-routing memory.

### 2026-05-29 Add Claude Haiku Vision Selector

Goal: add Claude Haiku as a selectable OpenCode vision backend in the same `vision/*` routing style as Gemini.

Execution order:

- [x] Add/update the local task checklist before editing code.
- [x] Add the Anthropic AI SDK dependency for OpenCode plugins/config.
- [x] Add Anthropic Claude Haiku provider/model entries to both OpenCode config copies.
- [x] Teach `vision-router.js` to route `vision/claude-haiku` image/PDF turns to Anthropic.
- [x] Verify JSON/plugin syntax, package metadata, and update vision-routing memory.

### 2026-05-27 Apply GI Instruction Kit 2026.05.27.1

Goal: update copied GI instructions for config-service based task-manager discovery.

Execution order:

- [x] Apply local instruction updates for `gi config service` and `service_id`.
- [x] Add project task-manager config template if missing.
- [x] Record migration metadata after verification.

### 2026-05-25 Add OpenCode Vision LLM Selector

Goal: make the vision model selectable from OpenCode UI/config instead of only hardcoding it in the router.

Execution order:

- [x] Locate the OpenCode model selector/config surface and current vision-routing plugin settings.
- [x] Add or expose a selectable vision LLM option with minimal scoped changes.
- [x] Smoke-check config/plugin syntax and note how to use the selector.

### 2026-05-25 Separate Orchestrator And Vision Selection

Goal: keep the orchestrator agent selectable independently from the vision LLM choice.

Execution order:

- [x] Move vision choices out of the agent dropdown and into model-selector entries.
- [x] Teach plugins to treat `vision/*` model entries as routing selectors, not final orchestrator models.
- [x] Smoke-check that Loom can stay selected while the model dropdown controls only vision routing.

### 2026-05-25 Fix Gateway Image-Only Empty Input

Goal: ensure image-only turns routed to the gateway include a non-empty text part.

Execution order:

- [x] Patch deployable `vision-router.js` to add missing text for image-only payloads.
- [x] Sync the router to the native OpenCode runtime folder.
- [x] Smoke-check router behavior and resolved native config.

### 2026-05-25 Sync OpenCode Vision Plugins To Native Runtime

Goal: apply vision-routing fixes to the OpenCode Desktop native runtime folder, while keeping this repository as the deployable copy.

Execution order:

- [x] Find the native global config folder used by OpenCode Desktop.
- [x] Copy current vision plugin files to the native plugin folder.
- [x] Point native `opencode.jsonc` at the native plugin files.
- [x] Smoke-check native plugin syntax and resolved OpenCode config.

### 2026-05-25 Fix OpenCode Captioned Image Routing

Goal: make image attachments with a user caption route through vision analysis without `input cannot be empty`.

Execution order:

- [x] Inspect current Mistral Conversations payload shape for captioned images.
- [x] Preserve the user's caption as non-empty text for both Mistral and fallback routing.
- [x] Smoke-check image-only and captioned-image hook behavior.

### 2026-05-25 Fix OpenCode Vision Text Leakage

Goal: stop image-routing helper text and empty image-only turns from surfacing as user-visible assistant output.

Execution order:

- [x] Inspect current vision plugins and config order.
- [x] Keep image analysis as internal context with a non-empty user prompt.
- [x] Smoke-check plugin syntax and hook behavior with an image-only turn.

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

### 2026-05-24 Harden OpenCode Vision Routing

Goal: avoid DeepSeek image-input failures and reduce Gemini overload impact for image turns.

Execution order:

- [x] Inspect current vision router and available vision-capable models.
- [x] Route image attachments to the local gateway vision model while keeping PDF on Gemini.
- [x] Smoke-check plugin syntax and OpenCode config loading.

### 2026-05-24 Add Mistral Vision Agent

Goal: use the provided Mistral Conversations Agent for image analysis before DeepSeek, while keeping Gemini available as fallback.

Execution order:

- [x] Add a local OpenCode plugin that calls the Mistral Agent for image attachments.
- [x] Register the plugin in root and `.opencode` configs.
- [x] Adjust image routing so Mistral text extraction feeds DeepSeek; keep Gemini nearby.
- [x] Smoke-check plugin import, hook behavior, and config loading.

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
