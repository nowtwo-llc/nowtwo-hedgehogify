import { ASSETS } from './assets.generated';
import type { HedgeHogifyConfig, HedgehogAsset } from './types';

export type { HedgeHogifyConfig, HedgehogAsset, HedgehogCharacter } from './types';

/**
 * Fallback location for the bundled images, used when no `imageBaseUrl` is configured
 * and the bundle was not loaded from a `<script>` tag we can resolve against.
 *
 * Points at the GitHub Pages deployment of this repository. Update this if the repo
 * moves to a different organisation.
 */
export const DEFAULT_ASSET_BASE_URL = 'https://nowtwo-llc.github.io/nowtwo-hedgehogify/assets/';

/** Konami code, as a sequence of `KeyboardEvent.key` values. */
const KONAMI_SEQUENCE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a'
] as const;

/** Legacy `keyCode` values, for events that predate (or omit) `KeyboardEvent.key`. */
const LEGACY_KEY_CODES: Record<number, string> = {
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    65: 'a',
    66: 'b'
};

/** Duration in milliseconds before hedgehog elements are cleared from the page. */
const BURST_DURATION_MS = 10000;

/** Default number of hedgehog elements created by {@link HedgeHogify.burst}. */
const DEFAULT_BURST_COUNT = 50;

/** After this many hedgehogs have been added, the next one is a large centered hedgehog. */
const LARGE_HEDGEHOG_THRESHOLD = 15;

/** Pixel size used for the large centered hedgehog. */
const LARGE_HEDGEHOG_SIZE = 530;

/** Minimum random image width in pixels. */
const MIN_IMAGE_WIDTH = 100;

/** Maximum random image width in pixels. */
const MAX_IMAGE_WIDTH = 350;

/** Maximum fraction of the viewport height used for random vertical positioning. */
const MAX_HEIGHT_RATIO = 0.75;

/** CSS class applied to every element this library adds to the page. */
const ELEMENT_CLASS = 'hedgehogify-image';

/** Duration of the click/tap flip, in milliseconds. */
const FLIP_DURATION_MS = 600;

/**
 * Depth applied to the container during a flip. Without it, `rotateY` reads as a
 * flat horizontal squash rather than a spin.
 */
const FLIP_PERSPECTIVE = '800px';

/** Marks an element mid-flip so rapid clicks don't restart the animation. */
const FLIPPING_ATTRIBUTE = 'data-hedgehogify-flipping';

/**
 * Whether the visitor has asked for reduced motion. Checked per flip rather than
 * cached, so the effect responds if the OS setting changes mid-session.
 */
const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The `src` of the script that loaded us, captured at module evaluation time.
 *
 * `document.currentScript` is only non-null while a classic script is executing, so this
 * has to be read here rather than lazily inside the constructor.
 */
const LOADING_SCRIPT_SRC: string =
    typeof document !== 'undefined' && document.currentScript instanceof HTMLScriptElement
        ? document.currentScript.src
        : '';

/**
 * A lightweight library that makes animated hedgehog characters burst across websites.
 *
 * Images are bundled with the package; nothing is requested from a backend service, and
 * no information about the host page leaves the browser.
 */
export class HedgeHogify {
    private _hedgeHogifyCount = 0;
    private _windowHeight = 768;
    private _windowWidth = 1024;

    private readonly _assets: readonly HedgehogAsset[];
    private readonly _imageBaseUrl: string;
    private readonly _duration: number;
    private readonly _flipOnClick: boolean;

    private _input: string[] = [];
    private _keydownHandler: ((ev: KeyboardEvent) => void) | null = null;

    constructor(config: HedgeHogifyConfig = {}) {
        const {
            disableSteve = false,
            disableMonsters = false,
            imageBaseUrl,
            duration = BURST_DURATION_MS,
            disableFlip = false
        } = config;

        this._assets = ASSETS.filter((asset) => {
            if (disableSteve && asset.character === 'steve') {
                return false;
            }
            if (disableMonsters && asset.character === 'monster') {
                return false;
            }
            return true;
        });

        this._imageBaseUrl = HedgeHogify.resolveAssetBaseUrl(imageBaseUrl);
        this._duration = duration;
        this._flipOnClick = !disableFlip;
    }

    /**
     * Spins a hedgehog a full turn on click or tap.
     *
     * A full 360° rotation means there is no back face to illustrate — the image
     * lands exactly where it started, so the inline transform can simply be
     * dropped once the animation finishes.
     */
    private static flip(imgEl: HTMLImageElement): void {
        // Ignore clicks while a spin is already running, rather than restarting it.
        if (imgEl.hasAttribute(FLIPPING_ATTRIBUTE) || prefersReducedMotion()) {
            return;
        }

        imgEl.setAttribute(FLIPPING_ATTRIBUTE, '');
        imgEl.style.transition = `transform ${FLIP_DURATION_MS}ms cubic-bezier(0.34, 1.16, 0.64, 1)`;
        imgEl.style.transform = 'rotateY(360deg)';

        setTimeout(() => {
            // 360° and no transform render identically, so clearing the transition
            // first removes the inline styles without the image spinning back.
            imgEl.style.transition = '';
            imgEl.style.transform = '';
            imgEl.removeAttribute(FLIPPING_ATTRIBUTE);
        }, FLIP_DURATION_MS);
    }

    /**
     * Works out where the bundled images live.
     *
     * @param configured - An explicit base URL, which always wins when provided.
     */
    private static resolveAssetBaseUrl(configured?: string): string {
        if (configured) {
            return configured.endsWith('/') ? configured : `${configured}/`;
        }
        if (LOADING_SCRIPT_SRC) {
            // The bundle lives in dist/, the images alongside it in assets/.
            return new URL('../assets/', LOADING_SCRIPT_SRC).href;
        }
        return DEFAULT_ASSET_BASE_URL;
    }

    /** The resolved base URL that images are loaded from. */
    public get imageBaseUrl(): string {
        return this._imageBaseUrl;
    }

    /** The images available to this instance, after character filtering. */
    public get assets(): readonly HedgehogAsset[] {
        return this._assets;
    }

    /**
     * Listens for the Konami code key sequence and triggers the provided callback.
     *
     * The Konami code is: Up, Up, Down, Down, Left, Right, Left, Right, B, A.
     * Calling this again replaces any previously registered listener.
     *
     * @param callback - Function to invoke when the full Konami code sequence is entered.
     */
    public konami(callback: () => void): void {
        this._input = [];

        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
        }

        this._keydownHandler = (ev: KeyboardEvent): void => {
            const key = ev.key || LEGACY_KEY_CODES[ev.keyCode] || '';
            this._input.push(key);

            // Keep only the most recent keys, so a wrong key can't permanently desync us.
            if (this._input.length > KONAMI_SEQUENCE.length) {
                this._input.shift();
            }

            const matches =
                this._input.length === KONAMI_SEQUENCE.length &&
                KONAMI_SEQUENCE.every((expected, i) => expected.toLowerCase() === this._input[i]?.toLowerCase());

            if (matches) {
                this._input = [];
                callback();
            }
        };

        document.addEventListener('keydown', this._keydownHandler);
    }

    /** Removes the Konami code listener registered by {@link konami}. */
    public destroy(): void {
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        this._input = [];
    }

    /**
     * Creates hedgehog image elements as fixed-position overlays on the page.
     * Elements are automatically cleared after the configured duration.
     *
     * Dispatches `he:hedgehogify:start` on `document` when the burst begins.
     *
     * @param count - Number of hedgehog elements to create (default {@link DEFAULT_BURST_COUNT}).
     */
    public burst(count = DEFAULT_BURST_COUNT): void {
        document.dispatchEvent(new Event('he:hedgehogify:start'));

        for (let i = 0; i < count; i += 1) {
            this.add();
        }

        setTimeout(() => {
            HedgeHogify.clear();
        }, this._duration);
    }

    /**
     * Creates an individual hedgehog DOM element with random positioning, sizing,
     * and mouse interaction animations (scale/rotate on hover).
     */
    private add(): void {
        if (this._assets.length === 0) {
            return;
        }

        this._hedgeHogifyCount += 1;

        const divEl = document.createElement('div');
        divEl.className = ELEMENT_CLASS;
        divEl.style.position = 'fixed';
        divEl.style.zIndex = '10';
        divEl.style.outline = '0';
        divEl.style.transition = 'all .1s linear';

        if (typeof window.innerHeight === 'number') {
            this._windowHeight = window.innerHeight;
            this._windowWidth = window.innerWidth;
        } else if (document.documentElement?.clientHeight) {
            this._windowHeight = document.documentElement.clientHeight;
            this._windowWidth = document.documentElement.clientWidth;
        }

        // Every LARGE_HEDGEHOG_THRESHOLD-th hedgehog is a large one, centered on screen.
        const isLarge = this._hedgeHogifyCount === LARGE_HEDGEHOG_THRESHOLD;

        // The centering below positions the element as though it were
        // LARGE_HEDGEHOG_SIZE wide, so the image has to actually be that wide or
        // it lands off-centre.
        const width = isLarge
            ? LARGE_HEDGEHOG_SIZE
            : Math.floor(Math.random() * (MAX_IMAGE_WIDTH - MIN_IMAGE_WIDTH)) + MIN_IMAGE_WIDTH;

        if (isLarge) {
            divEl.style.top = `${Math.max(0, Math.round((this._windowHeight - LARGE_HEDGEHOG_SIZE) / 2))}px`;
            divEl.style.left = `${Math.max(0, Math.round((this._windowWidth - LARGE_HEDGEHOG_SIZE) / 2))}px`;
            divEl.style.zIndex = '1000';
        } else {
            divEl.style.top = `${Math.round(this._windowHeight * (Math.random() * MAX_HEIGHT_RATIO))}px`;
            divEl.style.left = `${Math.round(Math.random() * 90)}%`;
        }

        const asset = this._assets[Math.floor(Math.random() * this._assets.length)];
        const imgEl = document.createElement('img');
        imgEl.setAttribute('src', `${this._imageBaseUrl}${asset.file}`);
        imgEl.setAttribute('alt', 'Hedgehog');
        imgEl.setAttribute('loading', 'lazy');
        imgEl.style.width = `${width}px`;

        if (this._flipOnClick) {
            divEl.style.perspective = FLIP_PERSPECTIVE;
            divEl.style.cursor = 'pointer';
            // Bound on the container so a tap anywhere in the element counts, but
            // the transform lands on the image so the container's own positioning
            // styles are left alone.
            divEl.onclick = (): void => {
                HedgeHogify.flip(imgEl);
            };
        }

        // Hover transforms the container while the flip transforms the image, so the
        // two never write to the same `transform`. Sharing one element made the first
        // click interpolate `rotate()/scale()` to `rotateY(360deg)` as a matrix —
        // which is the identity — so the hedgehog shrank instead of spinning.
        //
        // Uses the closure rather than `ev.target`, which resolves to the child image
        // once a real mouseover bubbles up from it.
        divEl.onmouseover = (): void => {
            const size = 1 + Math.round(Math.random() * 10) / 100;
            const angle = Math.round(Math.random() * 20 - 10);
            divEl.style.transform = `rotate(${angle}deg) scale(${size},${size})`;
        };
        divEl.onmouseout = (): void => {
            const size = 0.9 + Math.round(Math.random() * 10) / 100;
            const angle = Math.round(Math.random() * 6 - 3);
            divEl.style.transform = `rotate(${angle}deg) scale(${size},${size})`;
        };

        document.body.appendChild(divEl);
        divEl.appendChild(imgEl);
    }

    /**
     * Removes all hedgehog elements from the DOM.
     *
     * Dispatches `he:hedgehogify:stop` on `document` when clearing.
     */
    public static clear(): void {
        document.dispatchEvent(new Event('he:hedgehogify:stop'));
        document.querySelectorAll(`.${ELEMENT_CLASS}`).forEach((el) => el.remove());
    }
}

/**
 * Also available as the default export, so both import styles work:
 *
 *     import HedgeHogify from '@nowtwo-llc/hedgehogify';
 *     import { HedgeHogify } from '@nowtwo-llc/hedgehogify';
 */
export default HedgeHogify;
