# Hedgehogify

[![npm](https://img.shields.io/npm/v/@nowtwo-llc/hedgehogify.svg)](https://www.npmjs.com/package/@nowtwo-llc/hedgehogify)
[![CI](https://github.com/nowtwo-llc/nowtwo-hedgehogify/actions/workflows/ci.yml/badge.svg)](https://github.com/nowtwo-llc/nowtwo-hedgehogify/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

The best way to get hedgehogs to explode all over a website.

Hedgie the hedgehog and friends burst across the page, hang around for ten seconds, and
clean up after themselves. It is a tiny, dependency-free TypeScript library — the minified
UMD bundle is about 6 KB.

**[Try the demo →](https://nowtwo-llc.github.io/nowtwo-hedgehogify/)**

## Install

```bash
npm install @nowtwo-llc/hedgehogify
```

### Script tag

No build step — grab the UMD bundle and go. It exposes `HedgeHogify` as a global and finds
its images automatically, relative to the script's own URL.

```html
<script src="https://cdn.jsdelivr.net/npm/@nowtwo-llc/hedgehogify/dist/hedgehogify.min.js"></script>
<script>
    new HedgeHogify().burst();
</script>
```

Because the images ship inside the package, jsDelivr serves them alongside the bundle and
they resolve on their own. Pin a version for production — `@nowtwo-llc/hedgehogify@3.0.0` —
so the artwork can never drift out of step with the code. unpkg works the same way.

## Usage

```javascript
import { HedgeHogify } from '@nowtwo-llc/hedgehogify';

const hedgehogify = new HedgeHogify();
hedgehogify.burst();
```

A burst drops 50 hedgehogs on the page and clears them after ten seconds.

### Bundlers need an image URL

The images ship as real files in the package rather than being inlined, which keeps the
bundle small. When you load the library through a bundler there is no script tag to resolve
them against, so tell it where they are served from:

```javascript
const hedgehogify = new HedgeHogify({
    imageBaseUrl: '/static/hedgehogify/'
});
```

Copy `node_modules/@nowtwo-llc/hedgehogify/assets/` to that path as part of your build. If
you skip this, the library falls back to loading images from the GitHub Pages deployment.

### Konami code

```javascript
const hedgehogify = new HedgeHogify();

hedgehogify.konami(() => {
    hedgehogify.burst();
});
```

Fires on ↑ ↑ ↓ ↓ ← → ← → B A. Call `destroy()` to remove the listener.

## API

### `new HedgeHogify(config?)`

| Option            | Type      | Default          | Description                                              |
| ----------------- | --------- | ---------------- | -------------------------------------------------------- |
| `disableSteve`    | `boolean` | `false`          | Removes Steve (the dog) from the pool of images.          |
| `disableMonsters` | `boolean` | `false`          | Removes the monsters that torment Hedgie.                 |
| `imageBaseUrl`    | `string`  | auto-detected    | Where the images are served from. A trailing slash is added if missing. |
| `duration`        | `number`  | `10000`          | Milliseconds before a burst clears itself.                |
| `disableFlip`     | `boolean` | `false`          | Turns off the click/tap spin.                             |

Character filtering is applied when the instance is constructed, so change a flag by
creating a new instance.

### Click to flip

Clicking or tapping a hedgehog spins it a full turn. It is on by default, skipped
automatically for visitors with `prefers-reduced-motion: reduce`, and turned off with
`disableFlip: true`.

### Methods

| Method              | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| `burst(count?)`     | Adds `count` hedgehogs (default `50`) and clears them after `duration`.   |
| `konami(callback)`  | Runs `callback` when the Konami code is entered. Replaces any prior listener. |
| `destroy()`         | Removes the Konami listener.                                              |
| `HedgeHogify.clear()` | Static. Removes every hedgehog currently on the page.                   |

### Properties

| Property        | Description                                             |
| --------------- | ------------------------------------------------------- |
| `imageBaseUrl`  | The resolved base URL images are loaded from.            |
| `assets`        | The images available to this instance, after filtering.  |

### Events

Both are dispatched on `document`.

| Name                   | Description                          |
| ---------------------- | ------------------------------------ |
| `he:hedgehogify:start` | A burst has started.                 |
| `he:hedgehogify:stop`  | Hedgehogs are being cleared.         |

## Artwork

Images live in [`assets/`](./assets) and are bundled into the published package. The
filename prefix decides which character an image is, which is what makes `disableSteve` and
`disableMonsters` work without a server:

| Prefix     | Character | Disabled by       |
| ---------- | --------- | ----------------- |
| `hedgie-`  | Hedgie    | never             |
| `steve-`   | Steve     | `disableSteve`    |
| `monster-` | Monster   | `disableMonsters` |

Drop new files in and run `npm run assets` to regenerate the manifest. See
[`assets/README.md`](./assets/README.md) for details.

## Privacy

Everything runs in the browser. No request is made to any backend, and no information about
the host page leaves the visitor's machine.

## Development

Requires **Node 22 or newer** — jsdom 30 (used by the test suite) does not run on Node 20.
That is a toolchain requirement only; the published package is browser code and never runs
in Node.

```bash
npm install
npm run demo        # build, then serve the demo at http://localhost:5050
npm test            # Vitest, jsdom
npm run build:prod  # UMD + ESM + CJS into dist/, plus declarations
npm run lint        # ESLint with auto-fix
npm run typecheck   # tsc --noEmit
```

The library is one class in `src/HedgeHogify.ts`. `src/assets.generated.ts` is generated
from `assets/` — do not edit it by hand.

## License

MIT © NowTwo LLC — see [LICENSE](./LICENSE).

## Acknowledgments

- [The Cornify Project](https://www.cornify.com/)
- [Original Konami-JS Repo](https://github.com/snaptortoise/konami-js)
