import * as fs from "fs";
import path from "path";
import puppeteer, {DirectNavigationOptions, Response} from "puppeteer";
import {URL} from "url";
import {default as HttpCrawler, IHttpCrawlerOptions} from "./HttpCrawler";

export function writeToFile(filePath: string, fileName: string, content: string) {
    const fd = fs.openSync(path.join(filePath, fileName), "w");
    fs.writeFileSync(fd, content);
    fs.closeSync(fd);
}

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

function getAllDOMLinks(): string[] {
    return Array.prototype.map.call(
        document.querySelectorAll("a") || [],
        (linkElement: HTMLAnchorElement) => {
            return linkElement.getAttribute("href") || "";
        },
    ) as string[];
}

function logger(err: CrawlerError) {
    writeToFile(process.cwd(), "error-log.txt", err.toString());
    console.log(`${err.code}: ${err.message}`);
}

class CrawlerError extends Error {
    constructor(public code: string, ...params: any[]) {
        super(...params);

        this.code = code;
    }
}

async function requestHandleFn(url: string, options: IHttpCrawlerOptions) {

    try {
        // 1. Create browser instance.
        const browser = await puppeteer.launch({headless: true})
            .catch((err) => {
                throw new CrawlerError("ERR_CREATE_BROWSER", err);
            });

        // 2. Create page instance.
        const page = await browser.newPage()
            .catch((err) => {
                throw new CrawlerError("ERR_CREATE_PAGE", err);
            });

        await page.setViewport({...options.browserViewport})
            .catch((err) => {
                throw new CrawlerError("ERR_SET_VIEWPORT", err);
            });

        // 3. Subscribe to all desired page/console messages.
        page.on("error", (error: Error) => {
            console.log("page error", error);
        });

        // 4. Open the page URL.
        // 404 is not considered an Error.
        const navigationOptions = { waitUntil: ["load", "domcontentloaded", "networkidle0"] as puppeteer.LoadEvent[] } as DirectNavigationOptions;
        const response = await page.goto(url, navigationOptions)
            .then((pageResponse: Response | null) => {
                if (pageResponse === null) {
                    throw new CrawlerError("ERR_OPEN_PAGE", new Error("Request is null"));
                }
                return pageResponse;
            })
            .catch((err: Error) => {
                throw new CrawlerError("ERR_OPEN_PAGE", err);
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
                throw new CrawlerError("ERR_BODY_LOAD", err);
            });

        const links: string[] | void = await page.evaluate(getAllDOMLinks)
            .then((linksFound) => {
                return filterLinks(linksFound, new URL(options.url));
            })
            .catch((err: Error) => {
                logger(new RequestError("ERR_GET_ALL_DOM_LINKS", err));
                return [];
            });

        const metrics = await page.metrics();

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
        return {
            url,
            status: 0,
            links: [],
            headers: {},
            metrics: {},
            errorMessage: err.toString(),
            errorCode: err.code,
        };
    }
}

function generateReport(options: IHttpCrawlerOptions) {
    const endTime = Date.now();
    const endMem = process.memoryUsage();

    console.log(`Done indexing.`);
    const urlObj = new URL(options.url);

    const memoryReport = [
        `Total Heap: ${Math.round((endMem.heapTotal - startMem.heapTotal) / 1024 / 1024 * 100) / 100} MB`,
        `Heap used: ${Math.round((endMem.heapUsed - startMem.heapUsed) / 1024 / 1024 * 100) / 100} MB`,
        `RSS: ${Math.round((endMem.rss - startMem.rss) / 1024 / 1024 * 100) / 100} MB`,
    ];

    const report = {
        "Browser orchestrator": "puppeteer",
        "Browser batch size": options.requestsPerBatch,
        "Website": urlObj.host,
        "Process time": `${(endTime - startTime) / 1000}s`,
        "Memory report": memoryReport.join(" "),
        "Links found": cInstance.storage.size,
        "Queue size": cInstance.queue.size,
        "Max. depth": options.linkDepth,
    };
    console.table([report]);

    console.log(`Writing reports ...`);
    writeToFile(process.cwd(), `${urlObj.host}-report.json`, JSON.stringify(report, null, "  "));
    writeToFile(process.cwd(), `${urlObj.host}-storage.json`, JSON.stringify([...cInstance.storage], null, "  "));
    writeToFile(process.cwd(), `${urlObj.host}-queue.json`, JSON.stringify([...cInstance.queue], null, "  "));

    console.log(`Done!`);
}

const cOptions = {
    // url: "http://serban.ghita.org",
    // url: "https://www.mercedes-benz.ro/passengercars/mercedes-benz-cars/models/eqc/registration.html/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/diplomatic-sales",
    // url: "https://www.mercedes-benz.ro/",
    url: "https://www.isleofdinosaurs.com",
    requestsPerBatch: 1,
    linkDepth: 0,
    linkLimit: 9999,
    knownHosts: ["ghita.org"],
    browserViewport: { width: 1920, height: 1080 },
};
const cInstance = new HttpCrawler(cOptions, requestHandleFn);

const startTime = Date.now();
const startMem = process.memoryUsage();

cInstance.search().then(() => generateReport(cOptions));
