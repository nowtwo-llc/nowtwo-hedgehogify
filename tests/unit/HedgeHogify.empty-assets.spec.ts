import { afterEach, describe, expect, it, vi } from 'vitest';

// Lives in its own file because vi.mock is hoisted to the top of the module and
// would otherwise empty the manifest for every other test in the suite.
vi.mock('../../src/assets.generated', () => ({ ASSETS: [] }));

import { HedgeHogify } from '../../src/HedgeHogify';

describe('HedgeHogify with an empty asset manifest', () => {
    afterEach(() => {
        HedgeHogify.clear();
        document.body.innerHTML = '';
    });

    it('reports an empty pool', () => {
        expect(new HedgeHogify().assets).to.have.lengthOf(0);
    });

    it('appends nothing to the page rather than empty containers', () => {
        new HedgeHogify().burst(5);
        expect(document.querySelectorAll('.hedgehogify-image')).to.have.lengthOf(0);
    });

    it('still dispatches the start event', () => {
        const onStart = vi.fn();
        document.addEventListener('he:hedgehogify:start', onStart);
        new HedgeHogify().burst(5);
        document.removeEventListener('he:hedgehogify:start', onStart);
        expect(onStart).toHaveBeenCalledOnce();
    });
});
