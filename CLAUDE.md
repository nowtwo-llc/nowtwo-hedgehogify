# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hedgehogify (`@classifylearning/hedgehogify`) is a lightweight (~1.5k) TypeScript library that makes animated hedgehog characters burst across websites. It's published to GitHub Package Registry as a UMD bundle.

## Build & Development Commands

- `npm run build:dev` — Development build to `build/` with source maps
- `npm run build:prod` — Production build to `dist/` (minified)
- `npm run watch` — Watch mode for development
- `npm run eslint` — Lint with auto-fix (ESLint + Prettier)
- `npm run eslint:format` — Format all source files with Prettier-ESLint
- `npm test` — Clean, build, then run unit tests (requires `npm run build:prod` first since Karma loads from `dist/`)
- `npm run test:unit` — Run Karma/Mocha/Chai unit tests only (uses `nwb test`)

Tests run in ChromeHeadless via Karma. Test files live in `tests/unit/**/*.spec.js`.

## Architecture

The entire library is a single class in `src/HedgeHogify.ts`:

- **Constructor** accepts an optional config object (`disableSteve`, `disableMonsters` flags)
- **`burst(count)`** — Creates `count` (default 50) hedgehog image elements as fixed-position overlays on the page, auto-clears after 10 seconds
- **`konami(callback)`** — Listens for the Konami code key sequence and triggers the callback
- **`clear()` (static)** — Removes all `.hedgehogify-image` elements from the DOM
- **`add()` (private)** — Creates individual hedgehog DOM elements with random positioning, sizing, and mouse interaction animations (scale/rotate on hover)

Images are fetched from `https://content.classifylearning.com/` with query parameters for cache-busting, current URL, and character disable flags.

Custom events `he:hedgehogify:start` and `he:hedgehogify:stop` are dispatched on `document` during burst lifecycle.

## Build Pipeline

Webpack 5 bundles `src/HedgeHogify.ts` as UMD format (library name: `HedgeHogify`). TypeScript compiles to ES5 for broad browser compatibility. CSS/SCSS is extracted via MiniCssExtractPlugin. The `example/` directory contains a working HTML demo.

## Code Style

- ESLint extends airbnb-base + TypeScript recommended + Prettier
- Prettier: 120 char line width, 4-space tabs, single quotes, no trailing commas
- Stylelint for CSS/SCSS files
- `no-underscore-dangle` is disabled (internal properties use underscore prefix convention)
- `@typescript-eslint/no-explicit-any` is off
