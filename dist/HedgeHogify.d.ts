import './HedgeHogify.css';
export declare class HedgeHogifyComponent {
    private _hedgeHogifyCount;
    private _hedgeHogifyUrl;
    private _windowHeight;
    private _windowWidth;
    private _numType;
    private _height;
    private _width;
    private _input;
    konami(callback: Function): void;
    add(): void;
    burst(count?: number): void;
    static clear(): void;
}
declare const _default: {
    HedgeHogifyComponent: typeof HedgeHogifyComponent;
};
export default _default;
