# OpenCode Vision Routing

Date: 2026-05-24

OpenCode Desktop loads global config from `C:\Users\Fil-Dom\.config\opencode`
and project config from this repository. Treat the global config folder as the
native runtime folder. This repository keeps deployable copies and notes for
reproducing the setup on other machines. DeepSeek V4 Pro does not accept raw
image/PDF attachments, so prompt-only routing is not enough: OpenCode rejects or
sends the attachment before the orchestrator can call a subagent.

For Desktop-facing fixes, the native runtime is the deployed target. Always
update and verify the native config/plugin files explicitly; do not leave native
`opencode.jsonc` pointing at project-local plugin paths unless the user asks for
a project-path test.

This project keeps DeepSeek V4 Pro as the primary OpenCode/Weave orchestrator
and routes visual turns through Gemini:

- `opencode.json` and `.opencode/opencode.json` define
  `deepseek/deepseek-v4-pro` as the primary model.
- `.opencode/agent/screenshot.md` uses `google/gemini-2.5-flash`.
- `.opencode/plugins/vision-router.js` hooks `chat.message` and switches
  DeepSeek turns with `image/*` or `application/pdf` attachments to
  `google/gemini-2.5-flash` before the provider call.
- OpenCode Desktop also needs the native plugin paths in the global plugin list:
  `file:///C:/Users/Fil-Dom/.config/opencode/plugin/mistral-vision-agent.js`
  before
  `file:///C:/Users/Fil-Dom/.config/opencode/plugin/vision-router.js`.

Update on 2026-05-24:

- Image attachments now route to `gateway/gpt-4o` instead of Gemini to avoid
  Gemini overload failures on ordinary screenshot/image questions.
- PDF attachments still route to `google/gemini-2.5-flash`, because the local
  gateway model is only configured for text/image input.
- The router recognizes `mime`, `mediaType`, `contentType`, filename, path, URL,
  and direct `image` part shapes.

Second update on 2026-05-24:

- Added `.opencode/plugins/mistral-vision-agent.js`, which calls the Mistral
  Conversations Agent `ag_019e5ae61d2f700fbbe0c187a08a7a0a` for image
  attachments before the final LLM call.
- On success, the plugin replaces image attachments with Mistral's text analysis
  and sends the final answer back through `deepseek/deepseek-v4-pro`.
- On failure or missing `MISTRAL_API_KEY`, the image attachment is left in place
  so the existing image-capable fallback route can handle it.
- Gemini remains configured as `google/gemini-2.5-flash` and is still used for
  PDF routing and the screenshot subagent.

Third update on 2026-05-25:

- Copied the current `mistral-vision-agent.js` and `vision-router.js` files into
  the native runtime folder under `C:\Users\Fil-Dom\.config\opencode\plugin\`.
- Switched `C:\Users\Fil-Dom\.config\opencode\opencode.jsonc` from the project
  copy of `vision-router.js` to the native plugin paths.
- Keep the project `.opencode/plugins/` files in sync as deployable copies.

Fourth update on 2026-05-25:

- Added project `vision/*` model-selector entries so the orchestrator agent can
  stay independently selected, e.g. `Loom (Main Orchestrator)` plus
  `vision/gemini` or `vision/mistral` in the model dropdown.
- The `vision/*` entries are routing selectors, not final LLM targets. For
  text-only turns, `vision-router.js` resets the call back to
  `deepseek/deepseek-v4-pro`.
- For visual turns, `vision-router.js` maps `vision/gemini`,
  `vision/gpt-4o`, `vision/openai-mini`, and `vision/openai-nano` to their
  configured backend models. `vision/gpt-4o` still falls back to Gemini for
  PDFs because the local gateway model is configured for text/image only.
- `mistral-vision-agent.js` runs for the default route and for
  `vision/mistral`, but skips explicit non-Mistral `vision/*` selectors.

Fifth update on 2026-05-29:

- Added `@ai-sdk/anthropic` to `.opencode/package.json` so OpenCode can load the
  Anthropic AI SDK provider locally.
- Added `anthropic/claude-haiku-4-5` as `Claude Haiku 4.5 Vision` in both
  project OpenCode config copies.
- Added the `vision/claude-haiku` selector beside `vision/gemini` and taught
  `vision-router.js` to map it to `anthropic/claude-haiku-4-5` for image and
  PDF turns.
- `mistral-vision-agent.js` already skips explicit non-Mistral `vision/*`
  selectors, so `vision/claude-haiku` bypasses the Mistral preflight and routes
  directly through Anthropic.

Sixth update on 2026-05-29:

- Added `openrouter` as an OpenAI-compatible provider in both project OpenCode
  config copies, using `OPENROUTER_API_KEY` and
  `https://openrouter.ai/api/v1`.
- Added `vision/openrouter-free`, `vision/nemotron`, and
  `vision/nemotron-omni` selector entries.
- `vision-router.js` maps `vision/openrouter-free` to `openrouter/free` and
  `vision/nemotron` to `nvidia/nemotron-nano-12b-v2-vl:free` for image turns.
- `vision-router.js` maps `vision/nemotron-omni` to
  `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`. In direct smoke tests,
  this reasoning model needed a larger token budget than the tiny `OK` test.
- PDF turns selected through these OpenRouter selectors still fall back to
  Gemini, because the selected OpenRouter free models are configured here for
  text/image input only.
- Live catalog check confirmed all three OpenRouter model IDs are currently
  present.

Operational notes:

- Update on 2026-05-29: the visible Desktop image-capable model is now
  `google/gemini-2.5-flash`, but text-only `loom` turns are still reset to
  `deepseek/deepseek-v4-pro` by `vision-router.js`.
- Image turns are converted to text evidence before the final DeepSeek call:
  the router calls Gemini vision first, then falls back to local LM Studio
  `qwen/qwen3.5-9b` via OpenAI-compatible `/v1/chat/completions`, then falls
  back to `openrouter/nvidia/nemotron-nano-12b-v2-vl:free`.
- If Gemini, LM Studio, and OpenRouter all fail, the router sends DeepSeek a
  sanitized diagnostic text part instead of the raw image.
- Local LM Studio defaults are `LMSTUDIO_BASE_URL=http://10.0.236.10:1234/v1`
  and `LMSTUDIO_VISION_MODEL=qwen/qwen3.5-9b`; override these environment
  variables if the LAN address or loaded model changes.
- `OPENROUTER_API_KEY` must be visible to the running OpenCode Desktop process
  before selecting `vision/openrouter-free` or `vision/nemotron`.
- `ANTHROPIC_API_KEY` must be visible to the running OpenCode Desktop process
  before selecting `vision/claude-haiku`.
- `GOOGLE_GENERATIVE_AI_API_KEY` must be visible to the running Desktop process.
  If it was set after Desktop started, fully restart OpenCode Desktop.
- Verified with `opencode run --agent "Loom (Main Orchestrator)" --file ...`:
  an attached PNG routed to Gemini and returned a visual answer instead of the
  DeepSeek image-input error.

Native app sync on 2026-05-29:

- Synced project OpenCode config into
  `C:\Users\Fil-Dom\.config\opencode\opencode.jsonc`.
- Preserved native app plugins and LSP settings, while setting
  `default_agent` to `loom` and keeping `loom` on
  `deepseek/deepseek-v4-pro`.
- Copied `vision-router.js` and `mistral-vision-agent.js` into the native
  `plugin\` folder.
- Installed native runtime dependencies for the configured providers:
  `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/anthropic`, and
  `@opencode_weave/weave`.
- Created a timestamped backup of the previous native app config before
  replacing it.

Image empty-input fix on 2026-05-29:

- Fixed `vision-router.js` to detect attachments across `input.parts`,
  `output.parts`, `input.message.parts`, and `output.message.parts`, not only
  `output.parts`.
- Fixed image-only turns so the fallback text part is inserted first and synced
  back into all known message containers before the provider call.
- Changed the default image route from the local gateway model to
  `openrouter/nvidia/nemotron-nano-12b-v2-vl:free`; explicit
  `vision/gpt-4o` still routes to the gateway model.
- Synced the patched plugins into the native OpenCode app folder and verified a
  simulated image-only `loom`/DeepSeek turn routes to NVIDIA with `text + file`
  parts.

Mistral rollback / NVIDIA restore on 2026-05-29:

- Removed the active `vision/mistral` selector from both project OpenCode config
  copies.
- Removed `.opencode/plugins/mistral-vision-agent.js` from the project plugin
  set and removed it from both project plugin lists.
- Pointed the `screenshot` subagent at
  `openrouter/nvidia/nemotron-nano-12b-v2-vl:free`, matching the prior
  Gemini-style dedicated screenshot agent but using NVIDIA via OpenRouter.
- Pointed Weave visual agents `pattern`, `weft`, and `warp` at
  `openrouter/nvidia/nemotron-nano-12b-v2-vl:free`.
- Smoke-check: JSON configs parse, `vision-router.js` passes `node --check`, and
  a simulated `loom`/DeepSeek image turn routes to
  `openrouter/nvidia/nemotron-nano-12b-v2-vl:free` with `text + image` parts.

Minimal NVIDIA route fix on 2026-05-29:

- Reduced project `opencode.json`, `.opencode/opencode.json`, and native
  `C:\Users\Fil-Dom\.config\opencode\opencode.jsonc` to the active minimum:
  `deepseek/deepseek-v4-pro`, `google/gemini-2.5-flash` fallback, OpenRouter
  NVIDIA Nemotron, `loom`, `screenshot`, and `vision-router.js`.
- Removed active `oh-my-opencode-slim`, `@opencode_weave/weave`, and Mistral
  plugin entries from the native plugin list so the agent dropdown is not
  populated by old Build/Plan/Orchestrator/Tapestry/Shuttle agents.
- Deleted the stale project `.opencode/weave-opencode.jsonc` file.
- Switched OpenRouter config from `@ai-sdk/openai` to
  `@ai-sdk/openai-compatible` and installed that dependency in both project and
  native OpenCode runtime folders.
- Updated `vision-router.js` so image turns use OpenRouter
  `/chat/completions` directly for
  `nvidia/nemotron-nano-12b-v2-vl:free`, replace image attachments with
  internal visual context text, and then return the final call to DeepSeek.
  This avoids OpenCode's invalid Responses API request path for OpenRouter.
- Synced the router into `C:\Users\Fil-Dom\.config\opencode\plugin\`.
- Smoke-checks: project/native JSON parse, project/native router `node --check`,
  `loom` image simulation returns `deepseek/deepseek-v4-pro` with text-only
  visual context after a live OpenRouter/NVIDIA preflight, and the same works
  for a direct `screenshot`/OpenRouter image turn.

Pasted image attachment fix on 2026-05-29:

- Broadened `.opencode/plugins/vision-router.js` image detection for pasted or
  dragged screenshots that arrive as `image_url`, `input_image`,
  `message.content[]`, `attachments`, `experimental_attachments`, nested
  `file`, nested `image`, or nested `attachment` payloads.
- Broadened image URL/path extraction to support string or object `image_url`
  values and nested file/image/attachment URL, path, source, or data fields.
- Replaced silent OpenRouter/Nemotron failure fallback with text-only diagnostic
  context sent back to `deepseek/deepseek-v4-pro`, so DeepSeek no longer receives
  a raw image and responds with generic "I cannot read image.png" text.
- Synced the patched router into
  `C:\Users\Fil-Dom\.config\opencode\plugin\vision-router.js`.
- Smoke-checks: project/native router `node --check`, simulated top-level
  `image_url`, nested `message.content[]` image, and attachment file payloads all
  become one text part on DeepSeek when vision preflight cannot run; live
  OpenRouter/Nemotron smoke with a tiny PNG returned text-only visual context on
  DeepSeek.

Follow-up after a real Desktop paste still reached DeepSeek on 2026-05-29:

- Added an explicit `export const server = VisionRouter` to match the current
  `@opencode-ai/plugin` module shape, while keeping the default/named exports.
- Added `experimental.chat.messages.transform` as a final pre-LLM guard: any
  user message history part with an image is converted to one text part
  containing either OpenRouter/Nemotron visual context or a sanitized diagnostic.
- Synced the native plugin copy again.
- Smoke-checks: project/native router `node --check`, `server` export identity,
  transform-hook diagnostic behavior without `OPENROUTER_API_KEY`, and live
  transform-hook OpenRouter/Nemotron visual-context behavior with a tiny PNG.

Context leakage / image-only rejection fix on 2026-05-29:

- Real Desktop screenshots showed two symptoms: image-only sends could be
  rejected as `image.png: no image support`, and captioned image turns could
  leak the router's internal visual-context wrapper into the final DeepSeek
  answer.
- Changed the `loom` prompt in project/native configs so it relies on extracted
  image facts from the hook instead of invoking the `screenshot` subagent on top
  of the hook.
- Changed the router's DeepSeek-facing text from an internal visual-context
  block to direct "Extracted facts from the attached image" evidence with no
  old `visual context`/provider/routing wording.
- Added a `provider.models` hook for `deepseek` that marks DeepSeek models as
  image-attachment capable in the UI/model capability layer, allowing image-only
  turns to reach `chat.message` where the router replaces the image with text.
- Synced `vision-router.js` and `opencode.jsonc` into the native OpenCode app
  folder.
- Smoke-checks: project/native router `node --check`, project/native JSON parse,
  provider hook returns `attachment: true` and `input.image: true` for
  `deepseek-v4-pro`, and a live tiny-PNG route returns one text part on
  DeepSeek without the old wrapper terms.

Second follow-up after Desktop still showed unsupported image input:

- Desktop was still stopping on `Model does not support image input`, which
  means the support check happens before `chat.message` for the selected model.
- Changed active `model` and `loom.model` to
  `openrouter/nvidia/nemotron-nano-12b-v2-vl:free` so the UI/model layer allows
  image input before hooks run.
- Updated `vision-router.js` so `loom` text-only turns selected on the image
  model are immediately reset to `deepseek/deepseek-v4-pro`; image turns are
  analyzed through OpenRouter/Nemotron, replaced with text evidence, and then
  also reset to DeepSeek.
- Removed the active `screenshot` subagent from project and native configs to
  stop the main model from talking about screenshot-subagent output.
- Synced native config/plugin again.
- Smoke-checks: text-only `loom` route on the image model becomes DeepSeek,
  image `loom` route becomes one DeepSeek text part without old
  `visual_context`/`screenshot subagent` wording, and project/native JSON and
  router syntax checks pass.

Native-path correction on 2026-05-29:

- Corrected `C:\Users\Fil-Dom\.config\opencode\opencode.jsonc` to load
  `file:///C:/Users/Fil-Dom/.config/opencode/plugin/vision-router.js` instead
  of the project-local `.opencode/plugins/vision-router.js`.
- Re-copied the current project router into
  `C:\Users\Fil-Dom\.config\opencode\plugin\vision-router.js`.
- Added a hard local rule in `AGENTS.md` and
  `tools/AGENT_WORKING_AGREEMENTS.md`: OpenCode Desktop runtime changes must
  update and verify native config/plugin files explicitly, and final/status
  reports must name the native paths changed.
- Verified native JSON parses, native router passes `node --check`, native
  plugins list contains only the native `vision-router.js` path, and native
  config no longer contains `D:/AI/open_code_plugins/.opencode/plugins`.
