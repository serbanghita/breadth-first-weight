import * as path from "path";
import puppeteer, { Browser, DirectNavigationOptions, Page, Response } from "puppeteer";
import { URL } from "url";
import { appendToFile, writeToFile } from "./FileSystem";
import { BrowserEventMessageLevel, IBrowserEventMessage, IHttpCrawlerMetrics, IHttpCrawlerOptions, IHttpCrawlerResponse } from "./HttpCrawler";
import HttpCrawlerContentError from "./HttpCrawlerContentError";
import HttpCrawlerRuntimeError from "./HttpCrawlerRuntimeError";
import { hashString } from "./Utility";

/**
 * This is a file containing all the private functions needed for
 * the method requestHandleFn.
 *
 * requestHandleFn - contains custom logic based on Puppeteer
 * browser orchestrator that plugs into HttpCrawler(options, requestFn)
 * in order to gather custom data while crawling through pages.
 */

/**
 * Check if the link object provided is of the root URL
 * (eg. http://www.test.com/, http://test.com)
 *
 * @param {URL} linkObj
 * @param {URL} knownUrlObj
 * @returns {boolean}
 */
function isRootLink(linkObj: URL, knownUrlObj: URL): boolean {
    const rootPaths = ["", "#", "/"];
    return (
        linkObj instanceof URL &&
        linkObj.hostname === knownUrlObj.hostname &&
        linkObj.hash === "" &&
        linkObj.search === "" &&
        rootPaths.indexOf(linkObj.href) !== -1
    );
}

/**
 * Returns new array of links that belong to the same known hostname
 * and have a valid format.
 *
 * @param {string[]} linksFound
 * @param {URL} knownUrlObj
 * @returns {string[]}
 */
function filterLinks(linksFound: string[], knownUrlObj: URL): string[] {
    const matchRelativeProtocol = new RegExp(`^\/\/`, "i");
    const linksFoundFiltered = linksFound
        .map((linkHref) => {
            if (typeof linkHref !== "string") {
                return "";
            }

            linkHref = linkHref.trim();

            let linkObj;
            try {
                // tld Domain URI.
                linkObj = new URL(linkHref);
            } catch (e) {
                // Non-standard URI.
                if (linkHref.match(matchRelativeProtocol)) {
                    linkObj = new URL(`${knownUrlObj.protocol}${linkHref}`);
                } else if (linkHref.substr(0, 1) !== "/") {
                    linkObj = new URL(`${knownUrlObj.origin}/${linkHref}`);
                } else {
                    linkObj = new URL(`${knownUrlObj.origin}${linkHref}`);
                }
            }

            if (isRootLink(linkObj, knownUrlObj)) {
                return "";
            }

            return linkObj.hostname === knownUrlObj.hostname ? linkObj.href : "";
        })
        .filter((linkHref) => linkHref !== "");

    // Remove duplicates.
    return [...new Set(linksFoundFiltered)];

}

/**
 * Returns an array of strings representing the a[href] links found
 * in the DOM of the page.
 *
 * @returns {string[]}
 */
function getAllDOMLinks(): string[] {
    return Array.prototype.map.call(
        document.querySelectorAll("a") || [],
        (linkElement: HTMLAnchorElement) => {
            return linkElement.getAttribute("href") || "";
        },
    ) as string[];
}

export function isEventMessageLevel(value: BrowserEventMessageLevel | string): value is BrowserEventMessageLevel {
    const allowedKeys: string[] = ["info", "warning", "error"];
    return allowedKeys.find((el) => el === value) !== undefined;
}

/**
 * Returns an object containing data about the current HTTP response.
 * Depending on the processing added to this method, the response
 * format can vary but should always adhere to IHttpCrawlerResponse interface.
 *
 * @param {string} url
 * @param {IHttpCrawlerOptions} options
 * @returns {Promise<IHttpCrawlerResponse>}
 */
export async function requestHandleFn(url: string, options: IHttpCrawlerOptions): Promise<IHttpCrawlerResponse> {

    let browser: Browser | undefined;
    let page: Page | undefined;
    let response: Response | undefined;
    const pageBrowserConsoleEvents: IBrowserEventMessage[] = [];

    function log(...msg: string[]) {
        // appendToFile(options.reportsPath, "messages.log", msg.join(" "));
        console.log(`debug:`, msg);
    }

    async function cleanupBrowser() {
        if (typeof browser !== "undefined") {
            await browser.close().catch((err: Error) => log("browser.close():", err.message));
        }
    }

    async function cleanupPage() {
        if (typeof page !== "undefined") {
            await page.off("error", errorListener);
            await page.off("pageerror", pageErrorListener);
            await page.off("console", consoleListener);
            await page.close().catch((err) => log("page.close():", err.message, (page as Page).url()));
        }
    }

    // Custom event listeners.

    function errorListener(err: Error) {
        log("errorListener():", err.message);

        const level = "error";
        const type = "browser";
        const text = err.message;
        const details = ""; // msg.stack,
        const identifier = hashString(`${level}-${type}-${text}`);

        pageBrowserConsoleEvents.push({ identifier, level, type, text, details });
    }

    // eg. [Error: ReferenceError: nonExistentVar is not defined at https://serbanghita.github.io/website-tests/:7:2]
    function pageErrorListener(msg: Error) {
        const level = "error";
        const type = "js";
        const text = msg.message;
        const details = ""; // msg.stack
        const identifier = hashString(`${level}-${type}-${text}`);

        pageBrowserConsoleEvents.push({ identifier, level, type, text, details });
    }

    function consoleListener(msg: puppeteer.ConsoleMessage) {
        const level = isEventMessageLevel(msg.type()) ? msg.type() as BrowserEventMessageLevel : "info";
        const type = "browser";
        const text = msg.text();
        const details = "";
        const identifier = hashString(`${level}-${type}-${text}`);

        pageBrowserConsoleEvents.push({ identifier, level, type, text, details });
    }

    function requestFailedListener(request: puppeteer.Request) {
        const failure = request.failure();
        const level = "error";
        const type = "network";
        const text = failure && failure.errorText || "";
        const identifier = hashString(`${level}-${type}-${text}`);

        pageBrowserConsoleEvents.push({
            identifier, level, type, text,
            details: {
                url: request.url(),
                obj: "", // request
            },
        });
    }

    async function requestFinishedListener(request: puppeteer.Request) {
        const resp = request.response();

        if (resp && resp.status() >= 400) {
            const level = "error";
            const type = "network";
            const text = resp.statusText();
            const identifier = hashString(`${level}-${type}-${text}`);

            pageBrowserConsoleEvents.push({
                identifier, level, type, text,
                details: {
                    method: request.method(),
                    httpStatusCode: resp.status(),
                    uri: resp.url(),
                    timestamp: (resp.status() as any).date,
                },
            });
        }
    }

    try {
        // 1. Create browser instance.
        browser = await puppeteer.launch({ headless: true })
            .catch(async (err) => {
                throw new HttpCrawlerRuntimeError("ERR_CREATE_BROWSER", err);
            });

        // 2. Create page instance.
        page = await browser.newPage()
            .catch(async (err) => {
                throw new HttpCrawlerRuntimeError("ERR_CREATE_PAGE", err);
            });

        await page.setViewport({ ...options.browserViewport })
            .catch(async (err) => {
                throw new HttpCrawlerRuntimeError("ERR_SET_VIEWPORT", err);
            });

        // 3. Subscribe to all desired page/console messages.
        page.on("error", errorListener);
        page.on("pageerror", pageErrorListener);
        page.on("console", consoleListener);
        page.on("requestfailed", requestFailedListener);
        page.on("requestfinished", requestFinishedListener);

        // 4. Open the page URL.
        // 404 is not considered an Error.
        const navigationOptions = {
            waitUntil: ["load", "domcontentloaded", "networkidle0"] as puppeteer.LoadEvent[],
        } as DirectNavigationOptions;
        response = await page.goto(url, navigationOptions)
            .then(async (pageResponse: Response | null) => {
                if (pageResponse === null) {
                    throw new HttpCrawlerRuntimeError("ERR_OPEN_PAGE", new Error("Request is null"));
                }
                return pageResponse;
            })
            .catch(async (err: Error) => {
                throw new HttpCrawlerRuntimeError("ERR_OPEN_PAGE", err);
            });

        // In case of an HTTP error, we don't care about the
        // rest of the processes and we exit with a response.
        if (response.status() >= 400) {
            await cleanupBrowser();
            await cleanupPage();

            return {
                url,
                status: response.status(),
                links: [],
                headers: response.headers(),
                metrics: {},
                errorMessage: "HTTP Error",
                errorCode: "ERR_HTTP_ERROR",
                redirected: false,
                redirectStatus: 0,
                redirectOriginalLocation: "",
                consoleEvents: pageBrowserConsoleEvents,
            };
        }

        await page.waitForSelector("body", { visible: true })
            .catch((err: Error) => {
                throw new HttpCrawlerContentError("ERR_BODY_LOAD", err);
            });

        const links: string[] | void = await page.evaluate(getAllDOMLinks)
            .then((linksFound) => {
                return filterLinks(linksFound, new URL(options.url));
            })
            .catch((err: Error) => {
                log("page.evaluate(getAllDOMLinks):", err.message);
                return [];
            });

        const metrics = await page.metrics() as IHttpCrawlerMetrics;

        await cleanupBrowser();
        await cleanupPage();

        const result: IHttpCrawlerResponse = {
            url,
            status: response.status(),
            links,
            headers: response.headers(),
            metrics,
            errorMessage: "",
            errorCode: "",
            redirected: false,
            redirectStatus: 0,
            redirectOriginalLocation: "",
            consoleEvents: pageBrowserConsoleEvents,
        };

        // If the request was redirected (301, 302) then
        // map the details of the first redirect in the chain.
        const redirectChain = response.request().redirectChain();
        if (redirectChain.length > 0) {
            const firstRedirectResponse = redirectChain[0].response();
            if (firstRedirectResponse !== null) {
                result.redirected = true;
                result.redirectStatus = firstRedirectResponse.status();
                result.redirectOriginalLocation = firstRedirectResponse.url();
            }
        }

        return result;

    } catch (err) {
        await cleanupBrowser();
        await cleanupPage();

        log("Exception:", err.code, err.message, response ? response.url() : "");

        let status = 0;
        let headers = {};
        if (err instanceof HttpCrawlerContentError && typeof response !== "undefined") {
            status = response.status();
            headers = response.headers();
        }
        return {
            url,
            status,
            headers,
            links: [],
            metrics: {},
            errorMessage: err.message,
            errorCode: err.code,
            redirected: false,
            redirectStatus: 0,
            redirectOriginalLocation: "",
            consoleEvents: pageBrowserConsoleEvents,
        };
    }
}
