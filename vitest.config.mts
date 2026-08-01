import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // The library is pure DOM manipulation — element creation, class names
        // and inline left/top styles — so it needs a document but never a
        // layout engine or real rendering.
        environment: 'jsdom',
        include: ['tests/**/*.spec.ts'],
        restoreMocks: true
    }
});
