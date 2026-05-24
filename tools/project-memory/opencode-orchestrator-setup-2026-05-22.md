# OpenCode Orchestrator Setup - 2026-05-22

Goal: configure OpenCode for orchestrated/multi-agent work.

Findings:

- Local `opencode` CLI was repaired on 2026-05-22:
  - Installed global npm package `opencode-ai` version `1.15.7`.
  - Added a direct `opencode.exe` copy beside npm shims in `C:\Users\Fil-Dom\AppData\Roaming\npm`.
  - Moved `C:\Users\Fil-Dom\AppData\Roaming\npm` to the front of the user PATH so new terminals can resolve `opencode`.
  - Verified with simulated fresh Machine+User PATH: `opencode --version` returns `1.15.7`; `where.exe opencode` finds the npm shims.
- OpenCode Desktop 1.15.5 is installed, but common orchestrator workflows expect OpenCode CLI.
- Node.js is available (`v24.14.1`) and npm is available (`11.11.0`), so the likely Windows install path is `npm install -g opencode-ai`.
- Official OpenCode config lives in `opencode.json` or `opencode.jsonc`, globally under `~/.config/opencode/` or per-project at the project root.
- OpenCode supports custom primary/subagents via `agent`, MCP servers via `mcp`, and plugins via `plugin`.
- Lightweight/manual orchestration can be done with a project `opencode.json` defining an `orchestrator` primary agent and worker subagents.
- Plugin route:
  - Weave: add `"plugin": ["@opencode_weave/weave"]` to `opencode.json`, restart OpenCode, use Loom as orchestrator.
  - Oh My OpenCode: install with `bunx oh-my-opencode install` or npm global install, then configure provider/auth choices. More powerful but heavier.

Recommended next step:

1. Connect at least one model provider with `/connect` or `opencode auth login`.
2. Start with Weave if the user wants minimal setup; use Oh My OpenCode if they want a large prebuilt agent harness.
3. For this workspace, add a per-project `opencode.json` only after confirming the chosen orchestration route.

Update on 2026-05-22:

- Configured this workspace for the Weave route.
- Root `opencode.json` enables `@opencode_weave/weave` with `deepseek/deepseek-chat`.
- `.opencode/opencode.json` is aligned with the root OpenCode model/plugin settings.
- `.opencode/weave-opencode.jsonc` pins the Weave schema to v0.8.0, maps all built-in Weave agents to `deepseek/deepseek-chat`, enables background concurrency of 2, and enables continuation recovery/idle prompts.
- Installed local `.opencode` dependencies:
  - `@opencode_weave/weave@0.8.0`
  - `@opencode-ai/plugin@1.15.7`
- Reinstalled global `opencode-ai`; direct CLI version check reports `1.15.7`.
- Smoke checks:
  - Root and `.opencode` OpenCode JSON parse successfully.
  - Weave JSONC parses successfully.
  - Direct plugin simulation resolves default agent as `Loom (Main Orchestrator)` with 8 Weave agents and 5 commands.
  - `opencode agent list` from this workspace shows Weave agents including `Loom (Main Orchestrator)`, `Tapestry (Execution Orchestrator)`, `pattern`, `thread`, `shuttle`, `spindle`, `weft`, and `warp`.
- `opencode agent list` emitted a non-blocking Weave warning that skills could not be fetched from the running OpenCode skill endpoint; agents still loaded.

Vision/image update on 2026-05-22:

- Switched the main OpenCode model to `opencode/gpt-5.4-mini` so the existing OpenCode Zen credential can handle image/screenshot inputs.
- Kept `deepseek/deepseek-chat` as `small_model` and for cheap text/read-only Weave roles (`thread`, `spindle`, `shuttle`).
- Updated Weave's primary/review/planning roles (`loom`, `tapestry`, `pattern`, `weft`, `warp`) to `opencode/gpt-5.4-mini`.
- Added OpenAI provider config as an optional direct-provider path using `{env:OPENAI_API_KEY}`; no key is stored in the repo.
- Added local plugin `.opencode/plugins/openai-image-tools.js` with a `generate_image` tool backed by OpenAI Images API. It saves generated images under `.opencode/generated-images/`.
- Added `.opencode/generated-images/` to `.gitignore`.
- Installed `.opencode` dependency `@ai-sdk/openai`.
- Smoke checks:
  - `opencode.json`, `.opencode/opencode.json`, and `.opencode/weave-opencode.jsonc` parse successfully.
  - The image plugin imports and exposes `generate_image`.
  - `opencode debug config` lists `file:///D:/AI/open_code/.opencode/plugins/openai-image-tools.js`, default agent `Loom (Main Orchestrator)`, and main model `opencode/gpt-5.4-mini`.
  - `opencode models opencode` lists GPT 5.x models including `opencode/gpt-5.4-mini`.
- Real image generation was not executed because it requires `OPENAI_API_KEY` and would spend API quota.

Sources:

- https://opencode.ai/docs/config/
- https://opencode.ai/docs/agents/
- https://opencode.ai/docs/mcp-servers
- https://tryweave.io/docs/guide/getting-started
- https://ohmyopencode.com/installation/

Slim orchestration note from 2026-05-24:

- Global `~/.config/opencode/opencode.jsonc` loads:
  - `oh-my-opencode-slim` for specialist profiles.
  - `opencode-deepseek-thinking-fix`.
  - `opencode-token-tracker`.
- Python LSP is configured with `basedpyright --langserver`.
- Built-in OpenCode `explore` and `general` agents are disabled. Work is expected to flow through custom specialists from `oh-my-opencode-slim`.
- `plan` and `build` keep `envinfo` disabled.
- Specialist profile shape in `~/.config/opencode/oh-my-opencode-slim.json`:
  - `orchestrator`: `deepseek/deepseek-chat`, low variant, temperature 0.3, all skills.
  - `explorer`: `deepseek/deepseek-chat`, low variant, temperature 0.2.
  - `librarian`: `deepseek/deepseek-chat`, low variant, temperature 0.1, MCP websearch.
  - `oracle`: `deepseek/deepseek-reasoner`, high variant, temperature 0.5, reserved for complex architecture/debugging questions.
  - `designer`: `deepseek/deepseek-chat`, low variant, temperature 0.7.
  - `fixer`: `deepseek/deepseek-chat`, medium variant, temperature 0.2, `max_tokens: 4000`.
- TUI key expectations in `~/.config/opencode/tui.json`: exit via Ctrl+D or leader+q, paste via Ctrl+V or Ctrl+Shift+V, copy via Ctrl+C, terminal suspend disabled.
- Cost/latency intent: only `oracle` uses the reasoning model; other specialists stay on cheaper/faster `deepseek-chat`.

Applied on 2026-05-24:

- Installed global OpenCode config dependencies in `C:\Users\Fil-Dom\.config\opencode`:
  - `oh-my-opencode-slim@1.1.1`
  - `opencode-deepseek-thinking-fix@0.2.5`
  - `opencode-token-tracker@1.6.5`
- Wrote global `opencode.jsonc`, `oh-my-opencode-slim.json`, and `tui.json`.
- Added required LSP `extensions` for the custom `basedpyright --langserver` Python server: `.py` and `.pyi`.
- Smoke checks:
  - All three JSON files parse.
  - `opencode --version` returns `1.15.7`.
  - `opencode debug config` succeeds after the LSP extension fix.
  - Clean global `opencode agent list` includes the slim specialists and uses `orchestrator` as the default agent.
