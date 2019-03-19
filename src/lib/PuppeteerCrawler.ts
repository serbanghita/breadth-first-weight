import puppeteer, {DirectNavigationOptions, Response} from "puppeteer";
import {URL} from "url";
import {writeToFile} from "./FileSystem";
import {IHttpCrawlerMetrics, IHttpCrawlerOptions} from "./HttpCrawler";
import HttpCrawlerContentError from "./HttpCrawlerContentError";
import HttpCrawlerRuntimeError from "./HttpCrawlerRuntimeError";

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

/**
 * Logs the error (file, stdout, etc).
 * @param {HttpCrawlerRuntimeError} err
 */
function logger(err: HttpCrawlerRuntimeError) {
    writeToFile(process.cwd(), "error-log.txt", err.toString());
    console.log(`${err.code}: ${err.message}`);
}

/**
 * Returns an object containing data about the current HTTP response.
 * Depending on the processing added to this method, the response
 * format can vary but should always adhere to IResponse interface.
 *
 * @param {string} url
 * @param {IHttpCrawlerOptions} options
 * @returns {Promise<IResponse>}
 */
export async function requestHandleFn(url: string, options: IHttpCrawlerOptions) {

    try {
        // 1. Create browser instance.
        const browser = await puppeteer.launch({headless: true})
            .catch((err) => {
                throw new HttpCrawlerRuntimeError("ERR_CREATE_BROWSER", err);
            });

        // 2. Create page instance.
        const page = await browser.newPage()
            .catch((err) => {
                throw new HttpCrawlerRuntimeError("ERR_CREATE_PAGE", err);
            });

        await page.setViewport({...options.browserViewport})
            .catch((err) => {
                throw new HttpCrawlerRuntimeError("ERR_SET_VIEWPORT", err);
            });

        // 3. Subscribe to all desired page/console messages.
        page.on("error", (error: Error) => {
            console.log("page error", error);
        });

        // 4. Open the page URL.
        // 404 is not considered an Error.
        const navigationOptions = {
            waitUntil: ["load", "domcontentloaded", "networkidle0"] as puppeteer.LoadEvent[],
        } as DirectNavigationOptions;
        const response = await page.goto(url, navigationOptions)
            .then((pageResponse: Response | null) => {
                if (pageResponse === null) {
                    throw new HttpCrawlerRuntimeError("ERR_OPEN_PAGE", new Error("Request is null"));
                }
                return pageResponse;
            })
            .catch((err: Error) => {
                throw new HttpCrawlerRuntimeError("ERR_OPEN_PAGE", err);
            });

        // In case of an HTTP error, we don't care about the
        // rest of the processes and we exit with a response.
        if (response.status() >= 400) {
            return {
                url,
                status: response.status(),
                links: [],
                headers: response.headers(),
                metrics: {},
                errorMessage: "HTTP Error",
                errorCode: "ERR_HTTP_ERROR",
            };
        }

        await page.waitForSelector("body", { visible: true })
            .catch((err: Error) => {
                throw new HttpCrawlerContentError("ERR_BODY_LOAD", response, err);
            });

        const links: string[] | void = await page.evaluate(getAllDOMLinks)
            .then((linksFound) => {
                return filterLinks(linksFound, new URL(options.url));
            })
            .catch((err: Error) => {
                logger(new HttpCrawlerContentError("ERR_GET_ALL_DOM_LINKS", response, err));
                return [];
            });

        const metrics = await page.metrics() as IHttpCrawlerMetrics;

        await page.close();
        await browser.close();

        return {
            url,
            status: response.status(),
            links,
            headers: response.headers(),
            metrics,
            errorMessage: "",
            errorCode: "",
        };

    } catch (err) {
        let status = 0;
        let headers = {};
        if (err instanceof HttpCrawlerContentError) {
            status = err.response.status();
            headers = err.response.headers();
        }
        return {
            url,
            status,
            links: [],
            headers,
            metrics: {},
            errorMessage: err.message,
            errorCode: err.code,
        };
    }
}
