/** A character depicted by a bundled image. */
export type HedgehogCharacter = 'hedgie' | 'steve' | 'monster';

/** A bundled image, tagged with the character it depicts. */
export interface HedgehogAsset {
    /** Filename relative to the asset base URL, e.g. `hedgie-waving.png`. */
    file: string;
    /** Which character the image depicts, derived from the filename prefix. */
    character: HedgehogCharacter;
}

/** Configuration options for HedgeHogify. */
export interface HedgeHogifyConfig {
    /** When true, removes Steve (the dog) from the pool of images. Default `false`. */
    disableSteve?: boolean;
    /** When true, removes the monsters from the pool of images. Default `false`. */
    disableMonsters?: boolean;
    /**
     * Base URL the bundled images are served from. Must end with a slash.
     *
     * When omitted, the URL is resolved in this order:
     * 1. relative to the `<script>` tag that loaded the UMD bundle, then
     * 2. {@link DEFAULT_ASSET_BASE_URL}.
     *
     * Bundler users (webpack, Vite, esbuild) should set this explicitly, because a
     * bundled library has no script tag to resolve against.
     */
    imageBaseUrl?: string;
    /** Number of milliseconds before a burst clears itself. Default `10000`. */
    duration?: number;
    /**
     * When true, clicking or tapping a hedgehog no longer spins it. Default `false`.
     *
     * The flip is skipped automatically for visitors who prefer reduced motion.
     */
    disableFlip?: boolean;
}
