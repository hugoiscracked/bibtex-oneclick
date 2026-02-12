# BibTeX One-Click

A browser extension that adds a **BibTeX** button to every Google Scholar result. One click copies the BibTeX entry to your clipboard and collects it for later.

## Features

- **One-click copy** — A small "BibTeX" button appears next to each Scholar result. Click it to fetch and copy the BibTeX entry to your clipboard.
- **Visual feedback** — Buttons show loading, success ("✓ Copied!"), and error states. Already-collected entries stay marked in green ("✓ BibTeX"), even after page reload.
- **Session & All-Time collection** — Open the popup to browse collected entries in two tabs:
  - **Session** — entries collected since the browser started (resets on restart)
  - **All Time** — every entry ever collected, persisted across sessions
- **Copy All** — export the active tab's entries to the clipboard in one click.
- **Clear controls** — "Clear Session" button for quick resets; "Clear All-Time Data" is tucked behind a gear menu with a confirmation prompt.
- Works across multiple Google Scholar domains (`.com`, `.co.uk`, `.de`, `.fr`, `.ca`, `.co.jp`, `.com.au`, `.com.br`, `.com.hk`).

## Project Structure

```
manifest.json   — extension manifest (MV3, cross-browser)
background.js   — service worker: fetch proxy, collection storage
content.js      — injects BibTeX buttons into Scholar pages
content.css     — button styles
popup.html/js/css — collection popup with tabs
icons/          — extension icons (16, 48, 128)
```

## Local Development

### Chrome
1. Go to `chrome://extensions`, enable **Developer mode**.
2. Click **Load unpacked** and select this directory.

### Firefox
1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and select `manifest.json`.

### Notes

- The `browser_specific_settings.gecko` block in `manifest.json` is required for Firefox. Chrome ignores it, so the same manifest works for both.
- Both stores require icons. The `icons/` directory already has 16px, 48px, and 128px versions.
- If you plan to use `web-ext` for Firefox development, you can install it with `npm install -g web-ext` and run `web-ext build` to generate the `.zip` automatically.
