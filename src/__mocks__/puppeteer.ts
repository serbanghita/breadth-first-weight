import {Browser, Headers, LaunchOptions, Page, Response, Viewport} from "puppeteer";

const puppeteer = jest.genMockFromModule("puppeteer") as any;

export function __setMock(name: string): void {
    switch (name) {
        case "ERR_CREATE_BROWSER":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.reject(new Error(`Launch error`));
            };
            break;
        case "ERR_CREATE_PAGE":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.reject(`Creating browser error`),
                } as Browser);
            };
            break;
        case "ERR_OPEN_PAGE null":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.resolve(),
                        on(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.resolve(null);
                        },
                    } as Page),
                } as Browser);
            };
            break;
        case "ERR_HTTP_ERROR 404":
            puppeteer.launch = (options?: LaunchOptions) => {
                return Promise.resolve({
                    newPage: () => Promise.resolve({
                        setViewport: (viewport: Viewport) => Promise.resolve(),
                        on(eventName, handler) { return this; },
                        goto(url, navigationOptions) {
                            return Promise.resolve({
                                status: () => 404,
                                headers: () => {
                                    return { "content-type": "text/html;charset=utf-8" } as Headers;
                                },
                            } as Response);
                        },
                    } as Page),
                } as Browser);
            };
            break;
        default:
            return;
    }
}

export default puppeteer;
