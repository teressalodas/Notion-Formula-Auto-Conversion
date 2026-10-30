<div align="center">  
  <img src="./icon.png" width="100" height="100" alt="Notion Formula Auto Conversion">  
  <h1>Notion Formula Auto Conversion</h1>  
</div>

<p align="center">  
  <a href="https://raw.githubusercontent.com/teressalodas/Notion-Formula-Auto-Conversion/main/Notion-Formula-Auto-Conversion.user.js">  
    <img src="https://img.shields.io/badge/GitHub-Install%20Script-red?style=for-the-badge&logo=github" alt="Install Script" />
  </a>  
  <a href="./LICENSE">  
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge" alt="License: Apache License 2.0" />  
  </a>  
</p>

<p align="center"><a href="./README.md">简体中文</a> | English</p>

One-click conversion of plain-text LaTeX formulas pasted into Notion into native formula blocks or inline equations. It automatically decides between block-level and inline, takes over `Ctrl+Shift+E`, supports three scopes — selection, current line, and whole document — and shows a minimal capsule progress indicator at the top of the page.

## Install

After installing Violentmonkey / Tampermonkey, click **[Install Script](https://raw.githubusercontent.com/teressalodas/Notion-Formula-Auto-Conversion/main/Notion-Formula-Auto-Conversion.user.js)** and confirm.

## Supported Syntax

| Syntax | Result |
| ---- | ---- |
| `$$...$$` / `\[...\]` | Block-level formula |
| `$...$` / `\(...\)` | Inline formula |

Block-level conversion only applies when the formula occupies its own paragraph; otherwise it falls back to inline to keep content and position intact.

## Usage

Paste the formula → select the scope → press `Ctrl+Shift+E` (Mac: `Cmd+Shift+E`).

With a selection, only the selection is processed; with the cursor inside a formula line, only that line; otherwise the whole document. Formulas are converted from bottom to top, so when there are many, wait for the indicator to disappear before continuing to edit.

## Privacy

The script runs only on `app.notion.com`. It makes no network requests, reads or transmits none of your notes, and stores nothing locally.

## About

- The author is a member of the [LINUX DO](https://linux.do) community — thanks for the recognition and support.
- Found an issue? Submit it [here](https://github.com/teressalodas/Notion-Formula-Auto-Conversion/issues). PRs and Stars are welcome.
- Please follow Notion's Terms of Service.

## License

[Apache License 2.0](./LICENSE)
