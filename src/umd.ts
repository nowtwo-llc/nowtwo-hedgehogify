// UMD entry point.
//
// The <script src> build has no library name, so webpack copies every export
// key onto the global object. Building it from HedgeHogify.ts would therefore
// turn that module's default export into a literal `window.default` — a very
// generic global for a library to claim.
//
// This entry re-exports the named API only, keeping the browser globals to
// `HedgeHogify` and `DEFAULT_ASSET_BASE_URL`. The ESM and CJS bundles build
// from HedgeHogify.ts directly and do carry the default export.
export { DEFAULT_ASSET_BASE_URL, HedgeHogify } from './HedgeHogify';
