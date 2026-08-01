import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_ASSET_BASE_URL, HedgeHogify } from '../../src/HedgeHogify';

/** Typed querySelector so inline style assertions don't need casting at every call site. */
const query = (selector: string): HTMLElement | null => document.querySelector<HTMLElement>(selector);

const queryAll = (selector: string): NodeListOf<HTMLElement> => document.querySelectorAll<HTMLElement>(selector);

const imageSources = (): string[] =>
    Array.from(queryAll('.hedgehogify-image img')).map((img) => img.getAttribute('src') ?? '');

/** Konami code as modern `KeyboardEvent.key` values. */
const KONAMI_KEYS = [
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
];

const pressKey = (key: string): void => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key }));
};

const pressLegacyKey = (keyCode: number): void => {
    // Events that predate KeyboardEvent.key only carry the numeric keyCode.
    const event = new KeyboardEvent('keydown');
    Object.defineProperty(event, 'keyCode', { value: keyCode });
    document.dispatchEvent(event);
};

describe('HedgeHogify', () => {
    let instance: HedgeHogify | null = null;

    const create = (config?: ConstructorParameters<typeof HedgeHogify>[0]): HedgeHogify => {
        instance = new HedgeHogify(config);
        return instance;
    };

    afterEach(() => {
        // Remove the keydown listener before the next test registers its own.
        if (instance) {
            instance.destroy();
            instance = null;
        }
        HedgeHogify.clear();
        document.body.innerHTML = '';
    });

    // ── Constructor ────────────────────────────────────────────────────

    describe('constructor', () => {
        it('creates an instance with no config', () => {
            expect(create()).to.be.an.instanceOf(HedgeHogify);
        });

        it('creates an instance with empty config', () => {
            expect(create({})).to.be.an.instanceOf(HedgeHogify);
        });

        it('exposes every bundled asset by default', () => {
            const characters = create().assets.map((asset) => asset.character);
            expect(characters).to.include('hedgie');
            expect(characters).to.include('steve');
            expect(characters).to.include('monster');
        });
    });

    // ── Character filtering ────────────────────────────────────────────
    //
    // Replaces the old disable_steve=1 / disable_monsters=1 query-string
    // assertions. Filtering now happens client-side against the bundled
    // manifest rather than being delegated to a backend.

    describe('character filtering', () => {
        it('drops Steve from the pool when disableSteve is set', () => {
            const hh = create({ disableSteve: true });
            expect(hh.assets.map((asset) => asset.character)).to.not.include('steve');
        });

        it('drops monsters from the pool when disableMonsters is set', () => {
            const hh = create({ disableMonsters: true });
            expect(hh.assets.map((asset) => asset.character)).to.not.include('monster');
        });

        it('drops both when each flag is set', () => {
            const characters = create({ disableSteve: true, disableMonsters: true }).assets.map((a) => a.character);
            expect(characters).to.not.include('steve');
            expect(characters).to.not.include('monster');
            expect(characters).to.include('hedgie');
        });

        it('keeps every character when the flags are false', () => {
            const characters = create({ disableSteve: false, disableMonsters: false }).assets.map((a) => a.character);
            expect(characters).to.include('steve');
            expect(characters).to.include('monster');
        });

        it('never renders a filtered character across a large burst', () => {
            create({ disableSteve: true, disableMonsters: true }).burst(40);
            const offending = imageSources().filter((src) => src.includes('steve-') || src.includes('monster-'));
            expect(offending).to.have.lengthOf(0);
        });
    });

    // ── Image URLs ─────────────────────────────────────────────────────

    describe('image URLs', () => {
        it('falls back to the default asset base URL', () => {
            create().burst(1);
            expect(imageSources()[0]).to.match(/^https:\/\/.+\/assets\//);
            expect(imageSources()[0]).to.include(DEFAULT_ASSET_BASE_URL);
        });

        it('honours an explicit imageBaseUrl', () => {
            create({ imageBaseUrl: 'https://cdn.example.com/hogs/' }).burst(1);
            expect(imageSources()[0]).to.match(/^https:\/\/cdn\.example\.com\/hogs\//);
        });

        it('adds a missing trailing slash to imageBaseUrl', () => {
            const hh = create({ imageBaseUrl: 'https://cdn.example.com/hogs' });
            expect(hh.imageBaseUrl).to.equal('https://cdn.example.com/hogs/');
            hh.burst(1);
            expect(imageSources()[0]).to.not.include('hogsplaceholder');
        });

        it('points at a real bundled filename', () => {
            const hh = create({ imageBaseUrl: 'https://cdn.example.com/hogs/' });
            hh.burst(1);
            const files = hh.assets.map((asset) => asset.file);
            const rendered = imageSources()[0].replace('https://cdn.example.com/hogs/', '');
            expect(files).to.include(rendered);
        });

        it('does not leak the host page URL into the request', () => {
            // The old backend received document.location.href on every image.
            create().burst(3);
            imageSources().forEach((src) => {
                expect(src).to.not.include('url=');
                expect(src).to.not.include(document.location.href);
            });
        });
    });

    // ── burst() ────────────────────────────────────────────────────────

    describe('burst()', () => {
        it('dispatches he:hedgehogify:start', () => {
            const onStart = vi.fn();
            document.addEventListener('he:hedgehogify:start', onStart);
            create().burst(1);
            document.removeEventListener('he:hedgehogify:start', onStart);
            expect(onStart).toHaveBeenCalledOnce();
        });

        it('creates the default number of elements when no count is given', () => {
            create().burst();
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(50);
        });

        it('creates the specified number of elements', () => {
            create().burst(5);
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(5);
        });

        it('creates one element when count is 1', () => {
            create().burst(1);
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(1);
        });

        it('creates zero elements when count is 0', () => {
            create().burst(0);
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(0);
        });

        it('leaves elements in place until the duration elapses', () => {
            vi.useFakeTimers();
            create().burst(3);
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(3);

            vi.advanceTimersByTime(9999);
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(3);
            vi.useRealTimers();
        });

        it('auto-clears elements after the burst duration', () => {
            vi.useFakeTimers();
            create().burst(3);
            vi.advanceTimersByTime(10000);
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(0);
            vi.useRealTimers();
        });

        it('honours a custom duration', () => {
            vi.useFakeTimers();
            create({ duration: 500 }).burst(3);
            vi.advanceTimersByTime(499);
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(3);
            vi.advanceTimersByTime(1);
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(0);
            vi.useRealTimers();
        });
    });

    // ── clear() ────────────────────────────────────────────────────────

    describe('clear()', () => {
        it('dispatches he:hedgehogify:stop', () => {
            const onStop = vi.fn();
            document.addEventListener('he:hedgehogify:stop', onStop);
            HedgeHogify.clear();
            document.removeEventListener('he:hedgehogify:stop', onStop);
            expect(onStop).toHaveBeenCalledOnce();
        });

        it('removes all hedgehog elements from the DOM', () => {
            create().burst(10);
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(10);
            HedgeHogify.clear();
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(0);
        });

        it('does not throw when there is nothing to clear', () => {
            expect(() => HedgeHogify.clear()).to.not.throw();
        });

        it('can be called multiple times safely', () => {
            create().burst(5);
            HedgeHogify.clear();
            HedgeHogify.clear();
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(0);
        });
    });

    // ── DOM element properties ─────────────────────────────────────────

    describe('DOM elements', () => {
        it('creates a container div with the hedgehogify-image class', () => {
            create().burst(1);
            const div = query('.hedgehogify-image');
            expect(div).to.not.be.null;
            expect(div?.tagName).to.equal('DIV');
        });

        it('sets position to fixed on the container div', () => {
            create().burst(1);
            expect(query('.hedgehogify-image')?.style.position).to.equal('fixed');
        });

        it('sets z-index on the container div', () => {
            create().burst(1);
            expect(query('.hedgehogify-image')?.style.zIndex).to.equal('10');
        });

        it('sets a transition on the container div', () => {
            create().burst(1);
            expect(query('.hedgehogify-image')?.style.transition).to.include('linear');
        });

        it('creates an img element inside the container', () => {
            create().burst(1);
            const img = query('.hedgehogify-image img');
            expect(img).to.not.be.null;
            expect(img?.tagName).to.equal('IMG');
        });

        it('sets an alt attribute for accessibility', () => {
            create().burst(1);
            expect(query('.hedgehogify-image img')?.getAttribute('alt')).to.equal('Hedgehog');
        });

        it('marks images as lazy-loading', () => {
            create().burst(1);
            expect(query('.hedgehogify-image img')?.getAttribute('loading')).to.equal('lazy');
        });

        it('sets image width between 100px and 350px', () => {
            // The 15th is the large centered hedgehog and is sized separately.
            create().burst(14);
            queryAll('.hedgehogify-image img').forEach((img) => {
                const width = parseInt(img.style.width, 10);
                expect(width).to.be.at.least(100);
                expect(width).to.be.below(350);
            });
        });

        it('appends elements to document.body', () => {
            create().burst(1);
            expect(query('.hedgehogify-image')?.parentNode).to.equal(document.body);
        });

        it('sets a top position style', () => {
            create().burst(1);
            expect(query('.hedgehogify-image')?.style.top).to.not.be.empty;
        });

        it('sets a left position style', () => {
            create().burst(1);
            expect(query('.hedgehogify-image')?.style.left).to.not.be.empty;
        });
    });

    // ── Large hedgehog (15th element) ──────────────────────────────────

    describe('large hedgehog (15th element)', () => {
        it('sets z-index to 1000 on the 15th element', () => {
            create().burst(15);
            expect(queryAll('.hedgehogify-image')[14].style.zIndex).to.equal('1000');
        });

        it('sets z-index to 10 on non-15th elements', () => {
            create().burst(14);
            queryAll('.hedgehogify-image').forEach((el) => {
                expect(el.style.zIndex).to.equal('10');
            });
        });

        it('never positions the large hedgehog off the left edge', () => {
            create().burst(15);
            const left = queryAll('.hedgehogify-image')[14].style.left;
            expect(parseInt(left, 10)).to.be.at.least(0);
        });

        it('actually renders the 15th at the large size', () => {
            create().burst(15);
            const img = queryAll('.hedgehogify-image img')[14];
            expect(parseInt(img.style.width, 10)).to.equal(530);
        });

        it('centres the large hedgehog against its own rendered width', () => {
            // Regression: the element was centred as though it were 530px wide
            // while the image rendered at a random 100-350px, leaving it off-centre.
            create().burst(15);
            const div = queryAll('.hedgehogify-image')[14];
            const img = queryAll('.hedgehogify-image img')[14];
            const width = parseInt(img.style.width, 10);
            const expectedLeft = Math.max(0, Math.round((window.innerWidth - width) / 2));
            expect(parseInt(div.style.left, 10)).to.equal(expectedLeft);
        });

        it('sizes only the 15th element large across a bigger burst', () => {
            create().burst(30);
            const widths = Array.from(queryAll('.hedgehogify-image img')).map((img) => parseInt(img.style.width, 10));
            expect(widths.filter((w) => w === 530)).to.have.lengthOf(1);
            expect(widths[14]).to.equal(530);
        });
    });

    // ── Mouse interactions ─────────────────────────────────────────────

    describe('mouse interactions', () => {
        const fireMouseEvent = (type: 'mouseover' | 'mouseout', el: HTMLElement): void => {
            const event = new MouseEvent(type, { bubbles: true });
            Object.defineProperty(event, 'target', { value: el, enumerable: true });
            if (type === 'mouseover') {
                el.onmouseover?.(event);
            } else {
                el.onmouseout?.(event);
            }
        };

        it('applies a transform on mouseover', () => {
            create().burst(1);
            const div = query('.hedgehogify-image') as HTMLElement;
            fireMouseEvent('mouseover', div);
            expect(div.style.transform).to.include('rotate');
            expect(div.style.transform).to.include('scale');
        });

        it('applies a transform on mouseout', () => {
            create().burst(1);
            const div = query('.hedgehogify-image') as HTMLElement;
            fireMouseEvent('mouseout', div);
            expect(div.style.transform).to.include('rotate');
            expect(div.style.transform).to.include('scale');
        });

        it('sets both rotate and scale values on mouseover', () => {
            create().burst(1);
            const div = query('.hedgehogify-image') as HTMLElement;
            fireMouseEvent('mouseover', div);
            expect(div.style.transform).to.match(/rotate\(-?\d+deg\) scale\(\d+\.?\d*,\s?\d+\.?\d*\)/);
        });
    });

    // ── konami() ───────────────────────────────────────────────────────

    describe('konami()', () => {
        it('calls the callback when the full Konami code is entered', () => {
            const onCode = vi.fn();
            create().konami(onCode);
            KONAMI_KEYS.forEach(pressKey);
            expect(onCode).toHaveBeenCalledOnce();
        });

        it('accepts uppercase B and A', () => {
            const onCode = vi.fn();
            create().konami(onCode);
            [
                'ArrowUp',
                'ArrowUp',
                'ArrowDown',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight',
                'ArrowLeft',
                'ArrowRight',
                'B',
                'A'
            ].forEach(pressKey);
            expect(onCode).toHaveBeenCalledOnce();
        });

        it('supports legacy keyCode-only events', () => {
            const onCode = vi.fn();
            create().konami(onCode);
            [38, 38, 40, 40, 37, 39, 37, 39, 66, 65].forEach(pressLegacyKey);
            expect(onCode).toHaveBeenCalledOnce();
        });

        it('does not call the callback on a partial sequence', () => {
            const onCode = vi.fn();
            create().konami(onCode);
            KONAMI_KEYS.slice(0, 5).forEach(pressKey);
            expect(onCode).not.toHaveBeenCalled();
        });

        it('does not call the callback on a wrong key sequence', () => {
            const onCode = vi.fn();
            create().konami(onCode);
            ['a', 'b', 'c'].forEach(pressKey);
            expect(onCode).not.toHaveBeenCalled();
        });

        it('recovers after a wrong key is pressed', () => {
            const onCode = vi.fn();
            create().konami(onCode);
            ['ArrowUp', 'ArrowUp', 'a'].forEach(pressKey);
            KONAMI_KEYS.forEach(pressKey);
            expect(onCode).toHaveBeenCalledOnce();
        });

        it('resets input state when konami() is called again', () => {
            const onCode = vi.fn();
            const hh = create();
            hh.konami(onCode);
            ['ArrowUp', 'ArrowUp'].forEach(pressKey);
            hh.konami(onCode);
            expect(onCode).not.toHaveBeenCalled();
        });

        it('registers only one listener across repeated calls', () => {
            const onCode = vi.fn();
            const hh = create();
            hh.konami(onCode);
            hh.konami(onCode);
            hh.konami(onCode);
            KONAMI_KEYS.forEach(pressKey);
            expect(onCode).toHaveBeenCalledOnce();
        });

        it('stops responding after destroy()', () => {
            const onCode = vi.fn();
            const hh = create();
            hh.konami(onCode);
            hh.destroy();
            KONAMI_KEYS.forEach(pressKey);
            expect(onCode).not.toHaveBeenCalled();
        });
    });

    // ── Multiple bursts ────────────────────────────────────────────────

    describe('multiple bursts', () => {
        it('accumulates elements across multiple burst calls', () => {
            const hh = create();
            hh.burst(3);
            hh.burst(2);
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(5);
        });

        it('clear() removes elements from all bursts', () => {
            const hh = create();
            hh.burst(3);
            hh.burst(2);
            HedgeHogify.clear();
            expect(queryAll('.hedgehogify-image')).to.have.lengthOf(0);
        });
    });
});
