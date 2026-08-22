# dsh-input-polish

A DeepSeek Harness (DSH) dual-face plugin: a sparkles button beside the composer model selector that polishes the current draft with the selected model, plus a settings section for style and detail (persisted across restarts).

[English](README.md) | 中文

## Features

- **Polish button**: a sparkles icon at the right end of the composer tool row (just left of the model selector). Clicking it rewrites the current draft with the selected model and writes the result back into the composer.
- **Settings section**: Settings → "输入优化" lets you configure:
  - Style: concise / detailed / formal / casual
  - Detail: 3 points / 5 points / expand
- **Persistence**: style and detail are stored via the DSH `settings` service and survive restarts.
- **Failure state**: a spinner while busy, an alert icon on failure (click to retry).

## Install

### 1. Build

```bash
npm install
npm run build
```

This produces:
- `lib/index.js` — the host half (Cordis plugin)
- `lib/client.js` — the client half (a `window.__ModuleLoader__.load` browser bundle)

### 2. Install into your profile

```bash
dsh plugin --profile web add ../dsh-input-polish
```

Or manually add `dsh-input-polish` to your profile's `dsh.profile` bundles.

### 3. Restart DSH

The ✨ button appears beside the model selector, and the settings panel gains an "输入优化" section.

## Develop

```bash
npm run typecheck   # type check
npm run build       # tsc for the host + esbuild for the client
```

## Publish to GitHub

1. Create a GitHub repository named `dsh-input-polish`.
2. Replace `<your-username>` in `package.json` (`repository`/`homepage`/`bugs`).
3. Push the code.
4. Add the `dsh-plugin` topic on the repository page so it appears at <https://github.com/topics/dsh-plugin>.
5. (Optional) publish to npm: `npm publish`.

## License

MIT
