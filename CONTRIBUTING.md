# Contributing to Hedgehogify

Thanks for taking the time to contribute.

## Getting set up

Requires **Node 22 or newer**. jsdom 30, which the test suite runs on, declares
`^22.22.2 || ^24.15.0 || >=26.0.0` and fails on Node 20 with
`TypeError: webidl.util.markAsUncloneable is not a function` before a single test runs.

That is a toolchain requirement only — `engines.node` stays at `>=20` because that describes
consumers, and the published package is browser code that never executes in Node.

```bash
git clone git@github.com:nowtwo-llc/nowtwo-hedgehogify.git
cd nowtwo-hedgehogify
npm install
```

## Development workflow

```bash
npm run demo         # build, then serve the demo at http://localhost:5050
npm run watch        # rebuild ./build on change
npm run test:watch   # re-run the suite on change
```

## Before opening a pull request

Run the same checks CI does:

```bash
npm run typecheck
npm run lint
npm run test:coverage
npm run build:prod
```

Use `test:coverage` rather than `test` — the thresholds in `vitest.config.mts` only apply
when coverage runs, and CI runs it.

## Conventions

- **Never edit `src/assets.generated.ts` by hand.** It is generated from `assets/` by
  `scripts/generate-assets.mjs`; run `npm run assets`. Builds and tests regenerate it
  automatically, so a stale manifest shows up as a diff rather than a failure.
- **Artwork is named by prefix.** `hedgie-`, `steve-`, `monster-` decide which character an
  image is, and that is what makes `disableSteve` / `disableMonsters` work without a server.
  Anything unprefixed is treated as a hedgie.
- **`src/umd.ts` exists for a reason.** The UMD bundle copies every export key onto the
  global object, so building it from `HedgeHogify.ts` — which has a default export — creates
  a literal `window.default`. Keep the two entries separate.
- **Do not reintroduce a remote image dependency.** Images are vendored so the library works
  offline and depends on no host staying up.
- **ES2020 is set in two places.** `target` in `tsconfig.json` and `BUILD_TARGET`/`target` in
  `webpack.config.js`. Webpack's own runtime wrapper follows the latter, so changing one
  without the other silently ships syntax the tsconfig promised not to.
- **Tests run on jsdom with fake timers.** Advance time with `vi.advanceTimersByTime()`
  rather than waiting. Assertions are chai-style (`expect(x).to.equal(y)`), which Vitest
  supports natively.

## Releasing

Releases publish from CI:

1. Bump `version` in `package.json`.
2. Commit, then tag: `git tag v3.1.0 && git push --tags`.

The publish workflow verifies the tag matches `package.json`, runs the full check suite, and
publishes. `prepublishOnly` rebuilds `dist/` from the tagged source, so build output never
needs to be committed.
