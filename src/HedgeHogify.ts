export default class HedgeHogify {
    private _hedgeHogifyCount = 0;
    private _hedgeHogifyUrl = 'https://content.nowtwo-llc.com/hedgehogify.php';
    private _windowHeight = 768;
    private _windowWidth = 1024;
    private _numType = 'px';
    private _height = 0;
    private _width = 0;
    private _input = '';

    private _showSteve = true;
    private _showMonsters = true;

    constructor(config: any) {
        if (config && config.disableSteve) {
            this._showSteve = false;
        }
        if (config && config.disableMonsters) {
            this._showMonsters = false;
        }
    }

    public konami(callback: Function): void {
        this._input = '';

        // Hard coded Konami code.
        // Up, up, down, down, left, right, left, right, a, b
        // @TODO: Convert the old Konami code repo to a plugable repo.
        const key = '38384040373937396665';

        document.addEventListener('keydown', (ev): Function | null => {
            this._input += `${ev.keyCode}`;
            if (this._input === key) {
                return callback();
            }
            if (key.indexOf(this._input)) {
                this._input = `${ev.keyCode}`;
            }
            return null;
        });
    }

    public burst(count = 50): void {
        const startEvent = new Event('he:hedgehogify:start');
        document.dispatchEvent(startEvent);

        for (let i = 0; i < count; i += 1) {
            this.add();
        }

        setTimeout(() => {
            HedgeHogify.clear();
        }, 10000);
    }

    private add(): void {
        this._hedgeHogifyCount += 1;

        // Create a container DIV for our hedgehog.
        const _divEl = document.createElement('div');
        _divEl.style.position = 'fixed';

        // Prepare our lovely variables.
        const heightRandom = Math.random() * 0.75;
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
        _divEl.className = 'hedgehogify-image';
        _divEl.style.zIndex = String(10);
        _divEl.style.outline = String(0);
        _divEl.style.webkitTransition = 'all .1s linear';
        _divEl.style.webkitTransform = 'rotate(1deg) scale(1.01,1.01)';
        _divEl.style.transition = 'all .1s linear';

        // Clicking 15 times summons a large hedgehog centered on the screen.
        // Super exciting...
        if (this._hedgeHogifyCount === 15) {
            _divEl.style.top = `${Math.max(0, Math.round((this._windowHeight - 530) / 2))}px`;
            _divEl.style.left = `${Math.round((this._windowWidth - 530) / 2)}px`;
            _divEl.style.zIndex = String(1000);
            // Otherwise we randomize the position of our hedgehog.
        } else {
            if (this._numType === 'px') {
                _divEl.style.top = String(Math.round(this._windowHeight * heightRandom)) + this._numType;
            } else {
                _divEl.style.top = String(this._height) + this._numType;
            }
            _divEl.style.left = `${Math.round(Math.random() * 90)}%`;
        }
        const _imgEl = document.createElement('img');
        const currentTime = new Date();
        // This is our cache buster to make a new request for our hedgehog.
        const submitTime = currentTime.getTime() + Math.random();

        // Construct the actual request to load a random hedgehog.
        let requestUrl = `${this._hedgeHogifyUrl}randomize.php?r=${submitTime}&url=${document.location.href}`;
        if (!this._showSteve) {
            requestUrl += '&disable_steve=1';
        }
        if (!this._showMonsters) {
            requestUrl += '&disable_monsters=1';
        }
        _imgEl.setAttribute('src', requestUrl);
        _imgEl.style.width = `${Math.floor(Math.random() * (350 - 100)) + 100}px`;

        _divEl.onmouseover = (ev: MouseEvent): void => {
            const size = 1 + Math.round(Math.random() * 10) / 100;
            const angle = Math.round(Math.random() * 20 - 10);
            const result = `rotate(${angle}deg) scale(${size},${size})`;

            const el = ev.target as HTMLElement;
            el.style.transform = result;
            el.style.webkitTransform = result;
        };
        _divEl.onmouseout = (ev: MouseEvent): void => {
            const size = 0.9 + Math.round(Math.random() * 10) / 100;
            const angle = Math.round(Math.random() * 6 - 3);
            const result = `rotate(${angle}deg) scale(${size},${size})`;

            const el = ev.target as HTMLElement;
            el.style.transform = result;
            el.style.webkitTransform = result;
        };

        // Append our container DIV to the page.
        const bodyEl = document.getElementsByTagName('body')[0];
        bodyEl.appendChild(_divEl);
        _divEl.appendChild(_imgEl);
    }

    public static clear(): void {
        const stopEvent = new Event('he:hedgehogify:stop');
        document.dispatchEvent(stopEvent);

        const elements = document.querySelectorAll('.hedgehogify-image');
        elements.forEach((el) => el.remove());
    }
}
