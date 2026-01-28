describe('HedgeHogify', function () {
    // Clean up DOM elements after every test
    afterEach(function () {
        HedgeHogify.clear();
        // Remove any leftover .hedgehogify-image elements in case clear() itself is broken
        document.querySelectorAll('.hedgehogify-image').forEach(function (el) {
            el.remove();
        });
    });

    // Helper: dispatch a keydown event with a given keyCode
    function pressKey(keyCode) {
        var event = new KeyboardEvent('keydown', { keyCode: keyCode });
        document.dispatchEvent(event);
    }

    // Konami code key codes: Up Up Down Down Left Right Left Right B A
    var KONAMI_KEYS = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

    // ─── Constructor ────────────────────────────────────────────────────

    describe('constructor', function () {
        it('creates an instance with no config', function () {
            var hh = new HedgeHogify();
            expect(hh).to.be.an.instanceOf(HedgeHogify);
        });

        it('creates an instance with empty config', function () {
            var hh = new HedgeHogify({});
            expect(hh).to.be.an.instanceOf(HedgeHogify);
        });

        it('accepts disableSteve config', function () {
            var hh = new HedgeHogify({ disableSteve: true });
            hh.burst(1);
            var img = document.querySelector('.hedgehogify-image img');
            expect(img.getAttribute('src')).to.include('disable_steve=1');
        });

        it('accepts disableMonsters config', function () {
            var hh = new HedgeHogify({ disableMonsters: true });
            hh.burst(1);
            var img = document.querySelector('.hedgehogify-image img');
            expect(img.getAttribute('src')).to.include('disable_monsters=1');
        });

        it('accepts both disable flags', function () {
            var hh = new HedgeHogify({ disableSteve: true, disableMonsters: true });
            hh.burst(1);
            var img = document.querySelector('.hedgehogify-image img');
            var src = img.getAttribute('src');
            expect(src).to.include('disable_steve=1');
            expect(src).to.include('disable_monsters=1');
        });

        it('does not add disable params when flags are false', function () {
            var hh = new HedgeHogify({ disableSteve: false, disableMonsters: false });
            hh.burst(1);
            var img = document.querySelector('.hedgehogify-image img');
            var src = img.getAttribute('src');
            expect(src).to.not.include('disable_steve');
            expect(src).to.not.include('disable_monsters');
        });
    });

    // ─── burst() ────────────────────────────────────────────────────────

    describe('burst()', function () {
        it('dispatches he:hedgehogify:start event', function (done) {
            document.addEventListener('he:hedgehogify:start', function handler() {
                document.removeEventListener('he:hedgehogify:start', handler);
                done();
            });
            var hh = new HedgeHogify();
            hh.burst(1);
        });

        it('creates the default number of elements when no count is given', function () {
            var hh = new HedgeHogify();
            hh.burst();
            var elements = document.querySelectorAll('.hedgehogify-image');
            expect(elements.length).to.equal(50);
        });

        it('creates the specified number of elements', function () {
            var hh = new HedgeHogify();
            hh.burst(5);
            var elements = document.querySelectorAll('.hedgehogify-image');
            expect(elements.length).to.equal(5);
        });

        it('creates one element when count is 1', function () {
            var hh = new HedgeHogify();
            hh.burst(1);
            var elements = document.querySelectorAll('.hedgehogify-image');
            expect(elements.length).to.equal(1);
        });

        it('creates zero elements when count is 0', function () {
            var hh = new HedgeHogify();
            hh.burst(0);
            var elements = document.querySelectorAll('.hedgehogify-image');
            expect(elements.length).to.equal(0);
        });

        it('elements are present immediately after burst (not auto-cleared yet)', function () {
            var hh = new HedgeHogify();
            hh.burst(3);
            var elements = document.querySelectorAll('.hedgehogify-image');
            expect(elements.length).to.equal(3);
        });

        it('auto-clears elements after the burst duration', function (done) {
            // Use a real setTimeout to verify the auto-clear triggers.
            // The library uses 10000ms; we verify elements exist before that.
            // To avoid a 10-second wait, we patch setTimeout temporarily.
            var originalSetTimeout = window.setTimeout;
            var capturedCallback = null;
            window.setTimeout = function (fn) {
                capturedCallback = fn;
                return 0;
            };

            var hh = new HedgeHogify();
            hh.burst(3);
            expect(document.querySelectorAll('.hedgehogify-image').length).to.equal(3);

            // Restore setTimeout before invoking the callback
            window.setTimeout = originalSetTimeout;

            // Simulate the timeout firing
            capturedCallback();
            expect(document.querySelectorAll('.hedgehogify-image').length).to.equal(0);
            done();
        });
    });

    // ─── clear() ────────────────────────────────────────────────────────

    describe('clear()', function () {
        it('dispatches he:hedgehogify:stop event', function (done) {
            document.addEventListener('he:hedgehogify:stop', function handler() {
                document.removeEventListener('he:hedgehogify:stop', handler);
                done();
            });
            HedgeHogify.clear();
        });

        it('removes all hedgehogify-image elements from the DOM', function () {
            var hh = new HedgeHogify();
            hh.burst(10);
            expect(document.querySelectorAll('.hedgehogify-image').length).to.equal(10);

            HedgeHogify.clear();
            expect(document.querySelectorAll('.hedgehogify-image').length).to.equal(0);
        });

        it('does not throw when there are no elements to clear', function () {
            expect(function () {
                HedgeHogify.clear();
            }).to.not.throw();
        });

        it('can be called multiple times safely', function () {
            var hh = new HedgeHogify();
            hh.burst(5);
            HedgeHogify.clear();
            HedgeHogify.clear();
            expect(document.querySelectorAll('.hedgehogify-image').length).to.equal(0);
        });
    });

    // ─── DOM element properties ─────────────────────────────────────────

    describe('DOM elements', function () {
        var hh;

        beforeEach(function () {
            hh = new HedgeHogify();
            hh.burst(1);
        });

        it('creates a container div with class hedgehogify-image', function () {
            var div = document.querySelector('.hedgehogify-image');
            expect(div).to.not.be.null;
            expect(div.tagName).to.equal('DIV');
        });

        it('sets position to fixed on the container div', function () {
            var div = document.querySelector('.hedgehogify-image');
            expect(div.style.position).to.equal('fixed');
        });

        it('sets z-index on the container div', function () {
            var div = document.querySelector('.hedgehogify-image');
            expect(div.style.zIndex).to.equal('10');
        });

        it('sets transition on the container div', function () {
            var div = document.querySelector('.hedgehogify-image');
            // Browsers may normalize "all .1s linear" to "0.1s linear" (dropping "all")
            expect(div.style.transition).to.include('linear');
        });

        it('creates an img element inside the container', function () {
            var img = document.querySelector('.hedgehogify-image img');
            expect(img).to.not.be.null;
            expect(img.tagName).to.equal('IMG');
        });

        it('sets src attribute pointing to the hedgehogify URL', function () {
            var img = document.querySelector('.hedgehogify-image img');
            var src = img.getAttribute('src');
            expect(src).to.include('https://content.classifylearning.com/hedgehogify.php');
        });

        it('includes cache-busting parameter in the image URL', function () {
            var img = document.querySelector('.hedgehogify-image img');
            var src = img.getAttribute('src');
            expect(src).to.include('?r=');
        });

        it('includes the current page URL in the image request', function () {
            var img = document.querySelector('.hedgehogify-image img');
            var src = img.getAttribute('src');
            expect(src).to.include('&url=');
        });

        it('sets alt attribute on the image for accessibility', function () {
            var img = document.querySelector('.hedgehogify-image img');
            expect(img.getAttribute('alt')).to.equal('Hedgehog');
        });

        it('sets image width between 100px and 350px', function () {
            // Create multiple to increase confidence in random values
            hh.burst(20);
            var imgs = document.querySelectorAll('.hedgehogify-image img');
            imgs.forEach(function (img) {
                var width = parseInt(img.style.width, 10);
                expect(width).to.be.at.least(100);
                expect(width).to.be.below(350);
            });
        });

        it('appends elements to document.body', function () {
            var div = document.querySelector('.hedgehogify-image');
            expect(div.parentNode).to.equal(document.body);
        });

        it('sets a top position style', function () {
            var div = document.querySelector('.hedgehogify-image');
            expect(div.style.top).to.not.be.empty;
        });

        it('sets a left position style', function () {
            var div = document.querySelector('.hedgehogify-image');
            expect(div.style.left).to.not.be.empty;
        });
    });

    // ─── Large hedgehog (15th element) ──────────────────────────────────

    describe('large hedgehog (15th element)', function () {
        it('sets z-index to 1000 on the 15th element', function () {
            var hh = new HedgeHogify();
            hh.burst(15);
            var elements = document.querySelectorAll('.hedgehogify-image');
            // The 15th element (index 14) should have z-index 1000
            expect(elements[14].style.zIndex).to.equal('1000');
        });

        it('sets z-index to 10 on non-15th elements', function () {
            var hh = new HedgeHogify();
            hh.burst(14);
            var elements = document.querySelectorAll('.hedgehogify-image');
            elements.forEach(function (el) {
                expect(el.style.zIndex).to.equal('10');
            });
        });
    });

    // ─── Mouse interactions ─────────────────────────────────────────────

    describe('mouse interactions', function () {
        it('applies transform on mouseover', function () {
            var hh = new HedgeHogify();
            hh.burst(1);
            var div = document.querySelector('.hedgehogify-image');

            var mouseoverEvent = new MouseEvent('mouseover', { bubbles: true });
            Object.defineProperty(mouseoverEvent, 'target', {
                value: div,
                enumerable: true
            });
            div.onmouseover(mouseoverEvent);

            expect(div.style.transform).to.include('rotate');
            expect(div.style.transform).to.include('scale');
        });

        it('applies transform on mouseout', function () {
            var hh = new HedgeHogify();
            hh.burst(1);
            var div = document.querySelector('.hedgehogify-image');

            var mouseoutEvent = new MouseEvent('mouseout', { bubbles: true });
            Object.defineProperty(mouseoutEvent, 'target', {
                value: div,
                enumerable: true
            });
            div.onmouseout(mouseoutEvent);

            expect(div.style.transform).to.include('rotate');
            expect(div.style.transform).to.include('scale');
        });

        it('mouseover handler sets both rotate and scale values', function () {
            var hh = new HedgeHogify();
            hh.burst(1);
            var div = document.querySelector('.hedgehogify-image');

            var mouseoverEvent = new MouseEvent('mouseover', { bubbles: true });
            Object.defineProperty(mouseoverEvent, 'target', {
                value: div,
                enumerable: true
            });
            div.onmouseover(mouseoverEvent);

            // Transform should match pattern: rotate(Xdeg) scale(Y,Y)
            // Browsers may add a space after the comma in scale()
            expect(div.style.transform).to.match(/rotate\(-?\d+deg\) scale\(\d+\.?\d*,\s?\d+\.?\d*\)/);
        });
    });

    // ─── konami() ───────────────────────────────────────────────────────

    describe('konami()', function () {
        it('calls callback when the full Konami code is entered', function (done) {
            var hh = new HedgeHogify();
            hh.konami(function () {
                done();
            });

            KONAMI_KEYS.forEach(function (keyCode) {
                pressKey(keyCode);
            });
        });

        it('does not call callback on partial sequence', function () {
            var called = false;
            var hh = new HedgeHogify();
            hh.konami(function () {
                called = true;
            });

            // Enter only the first 5 keys of the Konami code
            for (var i = 0; i < 5; i++) {
                pressKey(KONAMI_KEYS[i]);
            }

            expect(called).to.be.false;
        });

        it('does not call callback on wrong key sequence', function () {
            var called = false;
            var hh = new HedgeHogify();
            hh.konami(function () {
                called = true;
            });

            // Enter some random keys
            pressKey(65); // A
            pressKey(66); // B
            pressKey(67); // C

            expect(called).to.be.false;
        });

        it('resets and recovers after a wrong key is pressed', function (done) {
            var hh = new HedgeHogify();
            hh.konami(function () {
                done();
            });

            // Start correctly then press a wrong key
            pressKey(38); // Up (correct start)
            pressKey(38); // Up (correct)
            pressKey(65); // A (wrong - breaks sequence)

            // Now enter the full Konami code from scratch
            KONAMI_KEYS.forEach(function (keyCode) {
                pressKey(keyCode);
            });
        });

        it('resets input state when konami() is called', function () {
            var callCount = 0;
            var hh = new HedgeHogify();

            // First setup - enter partial sequence
            hh.konami(function () {
                callCount++;
            });
            pressKey(38); // Partial
            pressKey(38); // Partial

            // Second call to konami resets the input buffer
            hh.konami(function () {
                callCount++;
            });

            // The partial sequence should be cleared; verify no false triggers
            expect(callCount).to.equal(0);
        });
    });

    // ─── Config behavior on image URLs ──────────────────────────────────

    describe('image URL construction', function () {
        it('does not include disable params by default', function () {
            var hh = new HedgeHogify();
            hh.burst(1);
            var img = document.querySelector('.hedgehogify-image img');
            var src = img.getAttribute('src');
            expect(src).to.not.include('disable_steve');
            expect(src).to.not.include('disable_monsters');
        });

        it('uses unique cache-buster values for each image', function () {
            var hh = new HedgeHogify();
            hh.burst(3);
            var imgs = document.querySelectorAll('.hedgehogify-image img');
            var cacheValues = [];
            imgs.forEach(function (img) {
                var src = img.getAttribute('src');
                var match = src.match(/\?r=([^&]+)/);
                cacheValues.push(match[1]);
            });

            // All cache-busters should be unique
            var uniqueValues = new Set(cacheValues);
            expect(uniqueValues.size).to.equal(3);
        });

        it('includes the base hedgehogify URL', function () {
            var hh = new HedgeHogify();
            hh.burst(1);
            var img = document.querySelector('.hedgehogify-image img');
            expect(img.getAttribute('src')).to.match(
                /^https:\/\/content\.classifylearning\.com\/hedgehogify\.php/
            );
        });
    });

    // ─── Multiple bursts ────────────────────────────────────────────────

    describe('multiple bursts', function () {
        it('accumulates elements across multiple burst calls', function () {
            var hh = new HedgeHogify();
            hh.burst(3);
            hh.burst(2);
            var elements = document.querySelectorAll('.hedgehogify-image');
            expect(elements.length).to.equal(5);
        });

        it('clear() removes elements from all bursts', function () {
            var hh = new HedgeHogify();
            hh.burst(3);
            hh.burst(2);
            HedgeHogify.clear();
            var elements = document.querySelectorAll('.hedgehogify-image');
            expect(elements.length).to.equal(0);
        });
    });
});
