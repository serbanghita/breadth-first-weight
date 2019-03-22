import {
    Browser,
    ElementHandle,
    EvaluateFn, EvaluateFnReturnType,
    Headers,
    LaunchOptions,
    Page, Request,
    Response,
    SerializableOrJSHandle,
    Viewport,
    WaitForSelectorOptions,
} from "puppeteer";

const puppeteer = jest.genMockFromModule("puppeteer") as any;

export function __setMock(name: string): void {
    switch (name) {
        case "filterLinks non-string":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.resolve(),
                        on(eventName, handler) { return this; },
                        off(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.resolve({
                                status: () => 200,
                                headers: () => {
                                    return { "content-type": "text/html;charset=utf-8" } as Headers;
                                },
                                request: () => {
                                    return { redirectChain: () => [] as Request[] } as Request;
                                },
                            } as Response);
                        },
                        waitForSelector(selector: string, selectorOptions: WaitForSelectorOptions) {
                            return Promise.resolve({}) as Promise<ElementHandle>;
                        },
                        evaluate<F extends EvaluateFn>(evaluateFn: F, ...evaluateFnArgs: SerializableOrJSHandle[]) {
                            return Promise.resolve([undefined, null, false, 0]) as Promise<EvaluateFnReturnType<F>>;
                        },
                        metrics() {
                            return Promise.resolve({ Timestamp: 1 });
                        },
                        close() {
                            return Promise.resolve();
                        },
                    } as Page),
                    close() {
                        return Promise.resolve();
                    },
                } as Browser);
            };
            break;
        case "filterLinks non-valid":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.resolve(),
                        on(eventName, handler) { return this; },
                        off(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.resolve({
                                status: () => 200,
                                headers: () => {
                                    return { "content-type": "text/html;charset=utf-8" } as Headers;
                                },
                                request: () => {
                                    return { redirectChain: () => [] as Request[] } as Request;
                                },
                            } as Response);
                        },
                        waitForSelector(selector: string, selectorOptions: WaitForSelectorOptions) {
                            return Promise.resolve({}) as Promise<ElementHandle>;
                        },
                        evaluate<F extends EvaluateFn>(evaluateFn: F, ...evaluateFnArgs: SerializableOrJSHandle[]) {
                            return Promise.resolve(["", " ", "\t", "/a", "a", "/", "//test.com/a"]) as Promise<EvaluateFnReturnType<F>>;
                        },
                        metrics() {
                            return Promise.resolve({ Timestamp: 1 });
                        },
                        close() {
                            return Promise.resolve();
                        },
                    } as Page),
                    close() {
                        return Promise.resolve();
                    },
                } as Browser);
            };
            break;
        case "ERR_CREATE_BROWSER":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.reject(new Error(`Launch error`));
            };
            break;
        case "ERR_CREATE_PAGE":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.reject(new Error(`Creating browser error`)),
                    close: () => Promise.resolve(),
                } as Browser);
            };
            break;
        case "ERR_SET_VIEWPORT":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.reject(new Error(`Cannot set the viewport`)),
                        on(eventName, handler) { return this; },
                        off(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.resolve(null);
                        },
                        close: () => Promise.resolve(),
                    } as Page),
                    close: () => Promise.resolve(),
                } as Browser);
            };
            break;
        case "ERR_OPEN_PAGE null":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.resolve(),
                        on(eventName, handler) { return this; },
                        off(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.resolve(null);
                        },
                        close: () => Promise.resolve(),
                    } as Page),
                    close: () => Promise.resolve(),
                } as Browser);
            };
            break;
        case "ERR_OPEN_PAGE exception":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.resolve(),
                        on(eventName, handler) { return this; },
                        off(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.reject(new Error("Request could not be performed"));
                        },
                        close: () => Promise.resolve(),
                    } as Page),
                    close: () => Promise.resolve(),
                } as Browser);
            };
            break;
        case "ERR_HTTP_ERROR 404":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.resolve(),
                        on(eventName, handler) { return this; },
                        off(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.resolve({
                                status: () => 404,
                                headers: () => {
                                    return { "content-type": "text/html;charset=utf-8" } as Headers;
                                },
                            } as Response);
                        },
                        close: () => Promise.resolve(),
                    } as Page),
                    close: () => Promise.resolve(),
                } as Browser);
            };
            break;
        case "ERR_BODY_LOAD":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.resolve(),
                        on(eventName, handler) { return this; },
                        off(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.resolve({
                                status: () => 200,
                                headers: () => {
                                    return { "content-type": "text/html;charset=utf-8" } as Headers;
                                },
                                url: () => "http://test.com/",
                            } as Response);
                        },
                        waitForSelector(selector: string, selectorOptions: WaitForSelectorOptions) {
                            return Promise.reject(new Error("Selector timeout")) as Promise<ElementHandle>;
                        },
                        close: () => Promise.resolve(),
                    } as Page),
                    close: () => Promise.resolve(),
                } as Browser);
            };
            break;
        case "ERR_GET_ALL_DOM_LINKS":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.resolve(),
                        on(eventName, handler) { return this; },
                        off(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.resolve({
                                status: () => 200,
                                headers: () => {
                                    return { "content-type": "text/html;charset=utf-8" } as Headers;
                                },
                                request: () => {
                                    return { redirectChain: () => [] as Request[] } as Request;
                                },
                            } as Response);
                        },
                        waitForSelector(selector: string, selectorOptions: WaitForSelectorOptions) {
                            return Promise.resolve({}) as Promise<ElementHandle>;
                        },
                        evaluate<F extends EvaluateFn>(evaluateFn: F, ...evaluateFnArgs: SerializableOrJSHandle[]) {
                            return Promise.reject(new Error("Selector timeout")) as Promise<EvaluateFnReturnType<F>>;
                        },
                        metrics() {
                            return Promise.resolve({});
                        },
                        close() {
                            return Promise.resolve();
                        },
                    } as Page),
                    close() {
                        return Promise.resolve();
                    },
                } as Browser);
            };
            break;
        case "200 valid request":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.resolve(),
                        on(eventName, handler) { return this; },
                        off(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.resolve({
                                status: () => 200,
                                headers: () => {
                                    return { "content-type": "text/html;charset=utf-8" } as Headers;
                                },
                                request: () => {
                                    return { redirectChain: () => [] as Request[] } as Request;
                                },
                            } as Response);
                        },
                        waitForSelector(selector: string, selectorOptions: WaitForSelectorOptions) {
                            return Promise.resolve({}) as Promise<ElementHandle>;
                        },
                        evaluate<F extends EvaluateFn>(evaluateFn: F, ...evaluateFnArgs: SerializableOrJSHandle[]) {
                            return Promise.resolve(["/a", "/b"]) as Promise<EvaluateFnReturnType<F>>;
                        },
                        metrics() {
                            return Promise.resolve({ Timestamp: 1 });
                        },
                        close() {
                            return Promise.resolve();
                        },
                    } as Page),
                    close() {
                        return Promise.resolve();
                    },
                } as Browser);
            };
            break;
        default:
            return;
    }
}

export default puppeteer;
