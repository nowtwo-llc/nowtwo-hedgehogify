import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // The library is pure DOM manipulation — element creation, class names
        // and inline left/top styles — so it needs a document but never a
        // layout engine or real rendering.
        environment: 'jsdom',
        include: ['tests/**/*.spec.ts'],
        restoreMocks: true,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: [
                // Generated from assets/ by scripts/generate-assets.mjs — a data
                // manifest, not logic.
                'src/assets.generated.ts',
                // Type-only module.
                'src/types.ts',
                // A build shim that re-exports the named API so the UMD global
                // never picks up a `default`. Tests import HedgeHogify.ts
                // directly, so this would report 0% and understate coverage.
                'src/umd.ts'
            ],
            reporter: ['text', 'lcov'],
            // Floors set just under the current numbers (96.63 / 89.28 / 100 /
            // 96.58), so an accidental drop fails CI but ordinary refactoring
            // does not. Raise them when coverage climbs; never lower them to
            // make a build pass.
            thresholds: {
                statements: 96,
                branches: 88,
                functions: 95,
                lines: 96
            }
        }
    }
});
