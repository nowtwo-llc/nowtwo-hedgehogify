/** Konami code key sequence: Up, Up, Down, Down, Left, Right, Left, Right, B, A */
const KONAMI_CODE = '38384040373937396665';

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

/** Configuration options for HedgeHogify. */
interface HedgeHogifyConfig {
    /** When true, disables Steve character images. */
    disableSteve?: boolean;
    /** When true, disables monster character images. */
    disableMonsters?: boolean;
}

/**
 * A lightweight library that makes animated hedgehog characters burst across websites.
 *
 * Creates fixed-position hedgehog image overlays on the page with random positioning,
 * sizing, and mouse interaction animations. Supports Konami code activation and
 * configurable character filtering.
 */
export class HedgeHogify {
    private _hedgeHogifyCount = 0;
    private _hedgeHogifyUrl = 'https://content.classifylearning.com/';
    private _windowHeight = 768;
    private _windowWidth = 1024;
    private _numType = 'px';
    private _height = 0;
    private _width = 0;
    private _input = '';

    private _showSteve = true;
    private _showMonsters = true;

    constructor(config?: HedgeHogifyConfig) {
        if (config && config.disableSteve) {
            this._showSteve = false;
        }
        if (config && config.disableMonsters) {
            this._showMonsters = false;
        }
    }

    /**
     * Listens for the Konami code key sequence and triggers the provided callback.
     *
     * The Konami code is: Up, Up, Down, Down, Left, Right, Left, Right, B, A.
     *
     * @param callback - Function to invoke when the full Konami code sequence is entered.
     */
    public konami(callback: () => void): void {
        this._input = '';

        document.addEventListener('keydown', (ev): void => {
            this._input += `${ev.keyCode}`;
            if (this._input === KONAMI_CODE) {
                callback();
                return;
            }
            if (KONAMI_CODE.indexOf(this._input) !== 0) {
                this._input = `${ev.keyCode}`;
            }
        });
    }

    /**
     * Creates hedgehog image elements as fixed-position overlays on the page.
     * Elements are automatically cleared after {@link BURST_DURATION_MS} milliseconds.
     *
     * Dispatches `he:hedgehogify:start` on `document` when the burst begins.
     *
     * @param count - Number of hedgehog elements to create (default {@link DEFAULT_BURST_COUNT}).
     */
    public burst(count = DEFAULT_BURST_COUNT): void {
        const startEvent = new Event('he:hedgehogify:start');
        document.dispatchEvent(startEvent);

        for (let i = 0; i < count; i += 1) {
            this.add();
        }

        setTimeout(() => {
            HedgeHogify.clear();
        }, BURST_DURATION_MS);
    }

    /**
     * Creates an individual hedgehog DOM element with random positioning, sizing,
     * and mouse interaction animations (scale/rotate on hover).
     */
    private add(): void {
        this._hedgeHogifyCount += 1;

        // Create a container DIV for our hedgehog.
        const divEl = document.createElement('div');
        divEl.style.position = 'fixed';

        // Prepare our lovely variables.
        const heightRandom = Math.random() * MAX_HEIGHT_RATIO;
        const documentEl = document.documentElement;

        if (typeof window.innerHeight === 'number') {
            this._windowHeight = window.innerHeight;
            this._windowWidth = window.innerWidth;
        } else if (documentEl && documentEl.clientHeight) {
            this._windowHeight = documentEl.clientHeight;
            this._windowWidth = documentEl.clientWidth;
        } else {
            this._numType = '%';
            this._height = Math.round(this._height * 100);
        }
        // Setting the DIV element properties.
        divEl.className = 'hedgehogify-image';
        divEl.style.zIndex = String(10);
        divEl.style.outline = String(0);
        divEl.style.transition = 'all .1s linear';

        // Clicking 15 times summons a large hedgehog centered on the screen.
        if (this._hedgeHogifyCount === LARGE_HEDGEHOG_THRESHOLD) {
            divEl.style.top = `${Math.max(0, Math.round((this._windowHeight - LARGE_HEDGEHOG_SIZE) / 2))}px`;
            divEl.style.left = `${Math.round((this._windowWidth - LARGE_HEDGEHOG_SIZE) / 2)}px`;
            divEl.style.zIndex = String(1000);
        } else {
            if (this._numType === 'px') {
                divEl.style.top = String(Math.round(this._windowHeight * heightRandom)) + this._numType;
            } else {
                divEl.style.top = String(this._height) + this._numType;
            }
            divEl.style.left = `${Math.round(Math.random() * 90)}%`;
        }
        const imgEl = document.createElement('img');
        const currentTime = new Date();
        // This is our cache buster to make a new request for our hedgehog.
        const submitTime = currentTime.getTime() + Math.random();

        // Construct the actual request to load a random hedgehog.
        let requestUrl = `${this._hedgeHogifyUrl}hedgehogify.php?r=${submitTime}&url=${document.location.href}`;
        if (!this._showSteve) {
            requestUrl += '&disable_steve=1';
        }
        if (!this._showMonsters) {
            requestUrl += '&disable_monsters=1';
        }
        imgEl.setAttribute('src', requestUrl);
        imgEl.setAttribute('alt', 'Hedgehog');
        imgEl.style.width = `${Math.floor(Math.random() * (MAX_IMAGE_WIDTH - MIN_IMAGE_WIDTH)) + MIN_IMAGE_WIDTH}px`;

        divEl.onmouseover = (ev: MouseEvent): void => {
            const size = 1 + Math.round(Math.random() * 10) / 100;
            const angle = Math.round(Math.random() * 20 - 10);
            const result = `rotate(${angle}deg) scale(${size},${size})`;

            const el = ev.target as HTMLElement;
            el.style.transform = result;
        };
        divEl.onmouseout = (ev: MouseEvent): void => {
            const size = 0.9 + Math.round(Math.random() * 10) / 100;
            const angle = Math.round(Math.random() * 6 - 3);
            const result = `rotate(${angle}deg) scale(${size},${size})`;

            const el = ev.target as HTMLElement;
            el.style.transform = result;
        };

        // Append our container DIV to the page.
        document.body.appendChild(divEl);
        divEl.appendChild(imgEl);
    }

    /**
     * Removes all `.hedgehogify-image` elements from the DOM.
     *
     * Dispatches `he:hedgehogify:stop` on `document` when clearing.
     */
    public static clear(): void {
        const stopEvent = new Event('he:hedgehogify:stop');
        document.dispatchEvent(stopEvent);

        const elements = document.querySelectorAll('.hedgehogify-image');
        elements.forEach((el) => el.remove());
    }
}
