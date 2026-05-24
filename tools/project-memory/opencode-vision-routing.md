# OpenCode Vision Routing

Date: 2026-05-24

OpenCode Desktop loads global config from `C:\Users\Fil-Dom\.config\opencode`
and project config from this repository. DeepSeek V4 Pro does not accept raw
image/PDF attachments, so prompt-only routing is not enough: OpenCode rejects
or sends the attachment before the orchestrator can call a subagent.

This project keeps DeepSeek V4 Pro as the primary OpenCode/Weave orchestrator
and routes visual turns through Gemini:

- `opencode.json` and `.opencode/opencode.json` define
  `deepseek/deepseek-v4-pro` as the primary model.
- `.opencode/agent/screenshot.md` uses `google/gemini-2.5-flash`.
- `.opencode/plugins/vision-router.js` hooks `chat.message` and switches
  DeepSeek turns with `image/*` or `application/pdf` attachments to
  `google/gemini-2.5-flash` before the provider call.
- OpenCode Desktop also needs the plugin path in the global plugin list:
  `file:///D:/AI/open_code_plugins/.opencode/plugins/vision-router.js`.

Operational notes:

- `GOOGLE_GENERATIVE_AI_API_KEY` must be visible to the running Desktop process.
  If it was set after Desktop started, fully restart OpenCode Desktop.
- Verified with `opencode run --agent "Loom (Main Orchestrator)" --file ...`:
  an attached PNG routed to Gemini and returned a visual answer instead of the
  DeepSeek image-input error.
