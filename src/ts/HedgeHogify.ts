export class HedgeHogifyComponent {
    private _hedgeHogifyCount = 0;
    private _hedgeHogifyUrl = 'https://nowtwo-llc.com/hedgehogify/';
    private _windowHeight = 768;
    private _windowWidth = 1024;
    private _numType = 'px';
    private _height = 0;
    private _width = 0;

    constructor() { }

    public konami(callback: Function): void {
        let input = '';
        const key = '38384040373937396665';

        document.addEventListener('keydown', function(ev) {
            input += ('' + ev.keyCode);
            if (input === key) {
                return callback();
            }
            if (!key.indexOf(input)) {
                return;
            }
            input = ('' + ev.keyCode);
        });
    }

    public add(): void {
        this._hedgeHogifyCount += 1;
    
        // Create a container DIV for our hedgehog.
        let _divEl = document.createElement('div');
        _divEl.style.position = 'fixed';

        // Prepare our lovely variables.
        const heightRandom = Math.random() * 0.75;
        const documentEl = document.documentElement;        

        if (typeof(window.innerHeight) == 'number') {
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
        if (this._hedgeHogifyCount == 15) {
            _divEl.style.top = Math.max(0, Math.round((this._windowHeight - 530) / 2)) + 'px';
            _divEl.style.left = Math.round((this._windowWidth - 530) / 2) + 'px';
            _divEl.style.zIndex = String(1000);
        // Otherwise we randomize the position of our hedgehog.
        } else {
            if (this._numType == 'px') {
                _divEl.style.top = Math.round(this._windowHeight * heightRandom) + this._numType;
            } else {
                _divEl.style.top = this._height + this._numType;
            }
            _divEl.style.left = Math.round(Math.random() * 90) + '%';
        }

        let _imgEl = document.createElement('img');
        const currentTime = new Date();
        // This is our cache buster to make a new request for our hedgehog.
        let submitTime = currentTime.getTime();

        if (this._hedgeHogifyCount == 15) {
            submitTime = 0;
        }

        // Construct the actual request to load a random hedgehog.
        const requestUrl = this._hedgeHogifyUrl + 'randomize.php' +
            '?r=' + submitTime + '&url=' + document.location.href;

        _imgEl.setAttribute('src', requestUrl);
        _imgEl.style.width = (Math.floor(Math.random() * (350 - 100)) + 100) + 'px';

        let that = this;
        _divEl.onmouseover = function(ev) {
            const size = 1 + Math.round(Math.random() * 10) / 100;
            const angle = Math.round(Math.random() * 20 - 10);
            const result = 'rotate(' + angle + 'deg) scale(' + size + ',' + size + ')';
            _divEl.style.transform = result;
            _divEl.style.webkitTransform = result;
        };
        _divEl.onmouseout = function(ev) {
            const size = .9 + Math.round(Math.random() * 10) / 100;
            const angle = Math.round(Math.random() * 6 - 3);
            const result = 'rotate(' + angle + 'deg) scale(' + size + ',' + size + ')';
            _divEl.style.transform = result;  
            _divEl.style.webkitTransform = result;
        };

        // Append our container DIV to the page.
        const bodyEl = document.getElementsByTagName('body')[0];
        bodyEl.appendChild(_divEl);
        _divEl.appendChild(_imgEl);   
    }

    public burst(count: number = 50): void {
        for (let i = 0; i < count; i++) {
            this.add();
        }

        setTimeout(this.clear, 10000);
    }

    public clear(): void {
        let elements = document.querySelectorAll('.hedgehogify-image');

        elements.forEach(el => el.remove());
    }
}