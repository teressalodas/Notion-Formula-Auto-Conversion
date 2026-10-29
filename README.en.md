<div align="center">    
  <img src="./icon.png" width="100" height="100" alt="Notion Formula Auto Conversion">    
  <h1>Notion Formula Auto Conversion</h1>  
</div>

<p align="center">    
  <a href="https://raw.githubusercontent.com/teressalodas/Notion-Formula-Auto-Conversion/main/Notion-Formula-Auto-Conversion.user.js">    
    <img src="https://img.shields.io/badge/GitHub-%E5%AE%89%E8%A3%85%E8%84%9A%E6%9C%AC-red?style=for-the-badge&logo=github" alt="Install Script" />
  </a>    
  <a href="./LICENSE">    
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge" alt="License: Apache License 2.0" />    
  </a>    
</p>

<p align="center"><a href="./README.md">简体中文</a> | English</p>

Notion Formula Auto Conversion is a free, open-source userscript that turns plain-text LaTeX formulas pasted into Notion into native Notion equation blocks or inline equations with a single keystroke. It decides automatically whether a formula should be block-level or inline, takes over the `Ctrl+Shift+E` shortcut, and works at three scopes — selection, current line, or the entire document — while showing progress in a minimal capsule indicator at the top of the page.

## Installation

First install Violentmonkey or Tampermonkey (Chrome / Edge / Firefox), then click the link below and confirm the installation in the dialog:

**[Install Notion Formula Auto Conversion](https://raw.githubusercontent.com/teressalodas/Notion-Formula-Auto-Conversion/main/Notion-Formula-Auto-Conversion.user.js)**

## Supported Syntax

| Syntax    | Result          |
| --------- | --------------- |
| `$$...$$` | Block equation  |
| `\[...\]` | Block equation  |
| `$...$`   | Inline equation |
| `\(...\)` | Inline equation |

A block equation is only converted into an equation block when the formula occupies a paragraph on its own. If other text shares the same line, it falls back to an inline equation so that content and position are never scrambled.

## Features

- **Automatic unwrapping**: strips the `$`, `$$`, `\(`, `\)` wrappers and hands only the LaTeX body to Notion.
- **Block vs. inline detection**: a line containing nothing but a block formula becomes an equation block; everything else is treated as inline.
- **Takes over `Ctrl+Shift+E`**: it only intercepts the shortcut when a formula is detected, and otherwise returns it to Notion untouched.
- **Three scopes**: with a selection it searches the selection, with the caret on a line it processes just that line, and with nothing selected it scans the whole document.
- **Minimal top indicator**: a capsule status bar shows "Converting (3/12)", turns into a green dot when done, or an orange dot when nothing was found or an error occurred — then disappears on its own.
- **Skips what it shouldn't touch**: code blocks, existing equation blocks, non-text containers, and popovers are all excluded.
- **No double triggering**: pressing the shortcut again mid-conversion is ignored, so runs never stack up.
- **Light/dark adaptive**: the indicator colors follow Notion's dark mode automatically.

## Usage

Paste your LaTeX-containing text into Notion, choose a scope, and press `Ctrl+Shift+E` (`Cmd+Shift+E` on Mac) — the script handles the rest:

| State when triggered                                | Scope processed                      |
| --------------------------------------------------- | ------------------------------------ |
| A non-collapsed selection that contains formulas    | The selection (only editors it hits) |
| No selection, caret inside a paragraph with formula | The current line                     |
| Anything else                                       | The whole document                   |

Conversion runs one formula at a time: block equations first insert `/math` to open an equation block and then fill in the LaTeX, while inline equations are replaced with the LaTeX body, selected, and handed to Notion's built-in equation shortcut. Formulas are processed from the bottom of the document upward so that nothing shifts out of place.

## Notes

- The script works by simulating real input and keyboard shortcuts. During conversion, please don't switch pages or click elsewhere — losing focus will interrupt the process.
- With many formulas you need to wait for each one in turn; keep editing only after the indicator disappears.
- Formulas that are already converted are never processed twice, so re-running is safe.

## Privacy & Security

- The script only runs on `app.notion.com`, and everything happens inside your own browser.
- It makes no network requests and never reads or transmits your notes.
- There are no settings, no local storage writes, and the indicator disappears when the page is closed.

## About

- The script locates targets through page structure and simulated input, so a Notion redesign may break shortcut interception or dialog confirmation. Please keep the script updated.
- If you run into a problem, open a [GitHub Issue](https://github.com/teressalodas/Notion-Formula-Auto-Conversion/issues) and mention your browser and what happened.
- Pull requests are welcome. If you find it useful, a Star on the repo is appreciated.
- Please comply with Notion's Terms of Service.

## License

This project is open source under the [Apache License 2.0](./LICENSE).
