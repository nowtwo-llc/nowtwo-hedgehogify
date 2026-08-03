# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hedgehogify (`@nowtwo-llc/hedgehogify`) is a lightweight, dependency-free TypeScript library
that makes animated hedgehog characters burst across websites. It ships as UMD + ESM + CJS
and is published as `@nowtwo-llc/hedgehogify` to two registries:

| Registry        | Role                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| npm (public)    | **Primary.** The only one documented publicly. Published with provenance. |
| GitHub Packages | Internal backup mirror. Not mentioned in the README.                     |

The npm org and the GitHub org are both `nowtwo-llc`, so one package name works for both —
GitHub Packages requires the scope to match the owning GitHub org, and it does.

Keep the README focused on npm only. The GitHub Packages copy exists for internal use and
documenting it publicly would push consumers toward a registry that demands authentication
even for public packages.

Owned by **NowTwo LLC**. All naming, metadata, copyright and documentation must stay under
NowTwo LLC and the `@nowtwo-llc` scope; do not reintroduce references to prior owners of
this code, including in historical notes.

## Commands

```bash
npm run demo          # build:prod, then serve the demo at http://localhost:5050 (PORT= to override)
npm test              # Vitest (jsdom). Regenerates the asset manifest first.
npm run test:watch    # Vitest in watch mode
npm run build:prod    # UMD + ESM + CJS into dist/, plus declarations into dist/types/
npm run build:dev     # UMD only, into build/
npm run assets        # Regenerate src/assets.generated.ts from assets/
npm run lint          # oxlint + Prettier, with fixes
npm run typecheck     # tsc -p tsconfig.json --noEmit
```

## Architecture

The library is one class in `src/HedgeHogify.ts`, with types in `src/types.ts`.

- **`burst(count)`** — Creates `count` (default 50) fixed-position hedgehog overlays, then
  auto-clears after `duration` (default 10s).
- **`konami(callback)`** — Watches for the Konami code. Matching uses a sliding window over
  `KeyboardEvent.key`, falling back to `keyCode` for legacy events. Replaces any previously
  registered listener; `destroy()` removes it.
- **`clear()`** (static) — Removes all `.hedgehogify-image` elements.
- **`add()`** (private) — Builds a single hedgehog element with random position, size, and
  hover transforms. Every 15th is a large centered one.
- **`flip()`** (private static) — Click/tap spins the image `rotateY(360deg)` over 600ms.
  A full turn means no back-face art is needed and the inline transform can just be dropped
  afterwards. `perspective` goes on the container so it reads 3D rather than as a flat
  squash. Guarded by a `data-hedgehogify-flipping` attribute against repeat clicks, and
  skipped for `prefers-reduced-motion`. Disable with `disableFlip: true`.

Note the hedgehog overlays are `position: fixed` at `z-index: 10` with live pointer
handlers, so they intercept clicks on the host page for the duration of a burst. The flip
makes that deliberate; `pointer-events: none` would be the alternative, but it would rule
out any click interaction.

Custom events `he:hedgehogify:start` and `he:hedgehogify:stop` are dispatched on `document`.

### Images

Images are **local files in `assets/`**, bundled into the published package. There is no
backend. Prior versions fetched every image from a remote image service, passing along the
host page URL; that host is dead and the phone-home is gone. Do not reintroduce a remote
image dependency — the point of vendoring the assets is that the library works offline and
depends on no host staying up.

`src/assets.generated.ts` is generated from `assets/` by `scripts/generate-assets.mjs` —
**never edit it by hand**. The filename prefix (`hedgie-`, `steve-`, `monster-`) determines
the character, which is how `disableSteve` / `disableMonsters` filter client-side.

The asset base URL resolves in this order:

1. an explicit `imageBaseUrl` config option,
2. `../assets/` relative to the `<script>` that loaded the UMD bundle (captured at module
   evaluation time, since `document.currentScript` is null by the time the constructor runs),
3. the `DEFAULT_ASSET_BASE_URL` constant, pointing at GitHub Pages.

Bundler consumers hit case 3 unless they set `imageBaseUrl`, because a bundled library has
no script tag to resolve against.

**The three `*-placeholder.svg` files are stand-ins, not shipping artwork.** The original
illustrations were never in this repo — they only ever lived on the dead PHP host — so real
art has to be supplied before release.

## Build System

Webpack 5 emits three bundles from one config array (`webpack.config.js`), matching the
sibling `nt-fireworksify` repo:

| Bundle                 | Format     | Notes                                     |
| ---------------------- | ---------- | ----------------------------------------- |
| `hedgehogify.min.js`   | UMD        | Script tag / unpkg / jsDelivr. Minified.  |
| `hedgehogify.mjs`      | ESM        | The `import` condition. Unminified so consumers can tree-shake. |
| `hedgehogify.cjs`      | CommonJS   | The `require` condition.                  |

`HedgeHogify` is exported both as a named export and as the default, so either import style
works. **The UMD bundle builds from `src/umd.ts`, not `src/HedgeHogify.ts`** — that output
has no library name, so webpack copies every export key onto the global object, and building
it from the module with the default export produced a literal `window.default`. `src/umd.ts`
re-exports the named API only. Do not collapse the two entries back together.

Declarations are emitted separately by `tsc -p tsconfig.types.json` into `dist/types/`.
esbuild-loader never emits declarations, so `tsc` is their only source. This also avoids three parallel compilers racing to
write the same `.d.ts` files.

`tsconfig.json` is deliberately emit-free — webpack owns bundles, `tsconfig.types.json` owns
declarations — so it can cover `src`, `tests`, and `example` for the editor, typecheck, and
type-aware lint rules.

## Versions & Constraints

`npm run update` rejects `jsdom` because ncu does not read dependabot's ignore rules and
would otherwise re-propose it on every run. `npm run update:check` is the unfiltered view —
run it to see what the pin is currently holding back. The pin is a speed bump, not a
decision; it has a defined exit condition:

| Pinned  | Held back by                                                                             | Lift it when                                             |
| ------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `jsdom` | Majors raise the Node floor (30 already needs >= 22.22.2, which broke the Node 20 CI leg) | You intend to raise the CI Node floor in the same change. |

Delete the entry from `--reject` and from `.github/dependabot.yml` together — they exist to
enforce the same decision from two directions.

- **Development requires Node 22+.** jsdom 30 declares
  `^22.22.2 || ^24.15.0 || >=26.0.0` and dies on Node 20 with
  `TypeError: webidl.util.markAsUncloneable is not a function` (undici calling a Node API
  that does not exist there) — it fails before any test runs. The CI matrix is 22.x/24.x for
  this reason. `engines.node` stays at `>=20` on purpose: that describes consumers, and the
  published package is browser code that never executes in Node.

- **TypeScript 7**, the native Go port. Reaching it meant replacing **ts-loader with
  esbuild-loader** and **typescript-eslint with oxlint** — both of the old tools call the TS 6
  JS compiler API, which TS 7 does not expose. typescript-eslint refuses TS 7 with an explicit
  runtime guard, and ESLint cannot parse TypeScript without it, so ESLint had to go too.
- **Do not add a second TypeScript** via the `@typescript/typescript6` shim to get
  typescript-eslint back. It installs, but two packages then ship a `tsc` binary and
  `node_modules/.bin/tsc` resolves by install order — a typecheck that silently runs the
  wrong compiler.
- **esbuild does not type-check.** `npm run build` will bundle code with type errors;
  `npm run typecheck` is the only gate, and CI runs it first.
- **oxlint** (`.oxlintrc.json`), scoped to the `correctness` category — deliberately the same
  surface as the `eslint:recommended` this repo had before, so the toolchain swap did not
  quietly change what is linted. `suspicious` and `perf` pull in unicorn opinions that were
  never enabled here; opt into them as their own change.
- **The trade-off is no type-aware rules** (`no-floating-promises` and friends). This library
  has no `async`, `await` or `Promise` anywhere in `src/`, so it costs nothing here — but that
  is why it was safe, not a general argument.
- Test files disable `no-unused-expressions` for chai-style assertions.

## Testing

Vitest with jsdom, `tests/**/*.spec.ts`. Assertions use the chai-style `expect(x).to.equal()`
API, matching `nt-fireworksify`.

`tests/unit/HedgeHogify.empty-assets.spec.ts` is a separate file because its `vi.mock` of the
generated manifest is hoisted and would otherwise empty the asset pool for the whole suite.

## Demo & Deployment

`example/` is the demo, deployed to GitHub Pages by `.github/workflows/pages.yml`. The
workflow mirrors the repo layout (`_site/example/`, `_site/dist/`, `_site/assets/`) plus a
root redirect, so the page's relative `../dist/` and `../assets/` paths work identically
locally and deployed — nothing is rewritten. `scripts/serve-demo.mjs` redirects `/` to
`/example/` for the same reason.

`.github/workflows/publish.yml` fires on a `v*` tag and has two jobs: `npm` publishes to the
public registry, then `github-packages` mirrors it (`needs: npm`, so the backup only runs
once the real publish succeeded). Load-bearing details:

- **`publishConfig` must not pin a `registry`.** It overrides the `registry-url` each job
  sets, so pinning one sends both publishes to the same place. Only `access: public` belongs
  there — scoped packages default to restricted and fail with a 402 on a free npm org.
- npm uses **trusted publishing (OIDC)**, not a token. That needs `id-token: write`, the
  `npm-publish` environment, Node >= 22.14.0, and npm >= 11.5.1 — hence the explicit
  `npm install -g npm@latest` step, since setup-node still ships npm 10.x. Provenance is
  attached automatically; there is no `--provenance` flag and no `NPM_TOKEN` secret.
- The `npm-publish` environment name must match the "Environment" field on the trusted
  publisher at npmjs.com. GitHub puts it in the OIDC claim and npm rejects a mismatch.
- **Never add `--provenance` to the GitHub Packages job** — that registry rejects provenance
  attestations and the publish fails. It authenticates with the built-in `GITHUB_TOKEN` plus
  `packages: write`.
- The tag-vs-`package.json` check runs before anything is published. A wrong version cannot
  be unpublished from either registry.

`.github/dependabot.yml` covers github-actions (weekly — it is what moves the SHA pins in
the workflows) and npm, grouping routine dev-dependency churn into one PR. jsdom majors are ignored on purpose: they move the Node floor. That is a deliberate
migration, not a bump.

## Code Style

- Prettier: 120 char width, 4-space indent, single quotes, no trailing commas, arrow parens
- `no-underscore-dangle` is off (private fields use an underscore prefix)
- `typescript/no-explicit-any` is off
