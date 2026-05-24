# Weave Orchestrator Summary - 2026-05-22

Scope: `D:\AI\open_code`.

User goal: configure and launch the Weave/OpenCode orchestrator.

Current state:

- OpenCode CLI is available through:
  `C:\Users\Fil-Dom\AppData\Roaming\npm\opencode.exe`
- Project config exists at `D:\AI\open_code\opencode.json`:
  - model: `deepseek/deepseek-chat`
  - small_model: `deepseek/deepseek-chat`
  - plugin: `@opencode_weave/weave`
- Local OpenCode plugin config exists at `D:\AI\open_code\.opencode\opencode.json`.
- Weave model overrides exist at `D:\AI\open_code\.opencode\weave-opencode.jsonc`.
  They force Loom/Tapestry/shuttle/pattern/thread/spindle/weft/warp to use
  `deepseek/deepseek-chat`, avoiding the broken default
  `github-copilot/claude-opus-4.6`.
- `D:\AI\open_code\.weave\runtime` was created by Weave/OpenCode runtime.

Verified:

- `opencode plugin @opencode_weave/weave` succeeded in `D:\AI\open_code`.
- `opencode agent list` shows Weave agents including:
  - `Loom (Main Orchestrator)`
  - `Tapestry (Execution Orchestrator)`
  - `shuttle`
  - `pattern`
  - `thread`
  - `spindle`
  - `weft`
  - `warp`
- Direct test succeeded:
  `opencode run "Reply OK" --agent "Loom (Main Orchestrator)" --model deepseek/deepseek-chat`
  returned `OK` and showed:
  `Loom (Main Orchestrator) · deepseek-chat`

Important correction:

- The user works in an OpenCode Desktop-style UI and does not want a PowerShell
  workflow as the primary answer.
- A screenshot showed a different project, `D:\AI\WorkNest`; I mistakenly
  configured Weave there. The user removed that config because it does not
  belong there.
- Continue treating `D:\AI\open_code` as the active project boundary unless the
  user explicitly gives another concrete path and action.

Known UI issue:

- In the shown Desktop UI, the visible dropdowns were mode (`Build`/`Plan`),
  model, and reasoning level. The UI did not expose a Weave agent selector.
- CLI sees and can run `Loom`; Desktop UI may need a project reload/restart or
  may not currently expose plugin-provided agents in that selector.

Useful commands:

```powershell
cd D:\AI\open_code
& "$env:APPDATA\npm\opencode.exe" agent list
& "$env:APPDATA\npm\opencode.exe" run "Reply OK" --agent "Loom (Main Orchestrator)" --model deepseek/deepseek-chat
```

Next suggested step:

- If continuing this task, focus on making the Desktop UI in `D:\AI\open_code`
  use `Loom (Main Orchestrator)` without asking the user to switch to a
  PowerShell workflow.
