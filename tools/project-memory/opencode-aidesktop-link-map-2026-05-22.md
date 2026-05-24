# OpenCode AI Desktop Link Map - 2026-05-22

Target executable:

- `C:\Users\Fil-Dom\AppData\Local\Programs\@opencode-aidesktop\OpenCode.exe`
- Product/file version: `1.15.5`
- Product version from executable metadata: `1.15.5.0`
- Company/description: `OpenCode`
- SHA256: `CF37BD66BF4FB122EB715A7D1194526FD11D0995785490D0E61A631CD58F4D58`
- Authenticode status: valid.
- Signer: `Anomaly Innovations, Inc https://anoma.ly/`

Install directory:

- `C:\Users\Fil-Dom\AppData\Local\Programs\@opencode-aidesktop`
- Electron-style layout with `resources\app.asar`, Chromium assets, locale `.pak` files, `resources\elevate.exe`, and `Uninstall OpenCode.exe`.
- `Uninstall OpenCode.exe` version: `1.15.5`, company `OpenCode`.

Updater metadata:

- `C:\Users\Fil-Dom\AppData\Local\Programs\@opencode-aidesktop\resources\app-update.yml`
- Update provider: GitHub.
- Owner/repo/channel: `anomalyco` / `opencode` / `latest`.
- Updater cache dir name: `@opencode-aidesktop-updater`.

Updater cache:

- `C:\Users\Fil-Dom\AppData\Local\@opencode-aidesktop-updater`
- Contains `installer.exe`, `current.blockmap`, and `pending\`.
- Pending update installer: `pending\opencode-desktop-win-x64.exe`.
- Pending installer signature: valid, signer `Anomaly Innovations, Inc https://anoma.ly/`.
- `pending\update-info.json` names `opencode-desktop-win-x64.exe`; admin rights required: `false`.

Windows shortcuts:

- `C:\Users\Fil-Dom\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\OpenCode.lnk`
- `C:\Users\Fil-Dom\Desktop\OpenCode.lnk`
- Both point to `C:\Users\Fil-Dom\AppData\Local\Programs\@opencode-aidesktop\OpenCode.exe`.

Uninstall registry:

- `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\d074f30d-5f88-5885-b075-be1348cc7676`
- Display name: `OpenCode 1.15.5`
- Display version: `1.15.5`
- Publisher: `OpenCode`
- Display icon: target `OpenCode.exe,0`
- Uninstall string: `Uninstall OpenCode.exe /currentuser`
- Quiet uninstall string: `Uninstall OpenCode.exe /currentuser /S`

Protocol association:

- `HKCU\Software\Classes\opencode`
- Default: `URL:opencode`
- `URL Protocol` value exists.
- Open command: `"C:\Users\Fil-Dom\AppData\Local\Programs\@opencode-aidesktop\OpenCode.exe" "%1"`

Application data directories:

- `C:\Users\Fil-Dom\AppData\Roaming\ai.opencode.desktop`
- `C:\Users\Fil-Dom\AppData\Roaming\@opencode-ai`
- `C:\Users\Fil-Dom\AppData\Local\@opencode-aidesktop-updater`
- `C:\Users\Fil-Dom\AppData\Local\SquirrelTemp` exists and was empty at inspection time.

Observed data under `ai.opencode.desktop`:

- Chromium/Electron data folders: `Cache`, `Code Cache`, `GPUCache`, `Local Storage`, `Network`, `Session Storage`, and related storage/cache directories.
- App files include `opencode.global.dat`, `opencode.settings`, `window-state.json`, `Preferences`, `Local State`, and multiple `opencode.workspace.*.dat` files.
- The contents of user workspace/cache files were not inspected.

Not found during the check:

- Running `OpenCode.exe` process.
- TCP connections owned by `OpenCode.exe`.
- `Run` or `RunOnce` autostart entries mentioning OpenCode/opencode.
- PATH entries mentioning OpenCode/opencode.
- Scheduled tasks mentioning OpenCode/opencode.
- App Paths registry entries mentioning OpenCode/opencode.
- Firewall rules named OpenCode/opencode.

