import * as fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import {URL} from "url";

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

function sequentialFnPromises(tasks: Array<() => Promise<any>>) {
    return tasks.reduce((promiseChain: Promise<any[]>, currentTask: () => Promise<any>) => {
        return promiseChain.then((chainResults) =>
            currentTask().then((currentResult) => [ ...chainResults, currentResult ]),
        );
    }, Promise.resolve([]));
}

function parallelFnPromises(tasks: Array<() => Promise<any>>) {
    return Promise.all(tasks.map((task) => task()));
}

export function chunkArray(array: any[], size: number): any[] {
    if (!array) {
        return [];
    }
    const firstChunk = array.slice(0, size);
    if (!firstChunk.length) {
        return array;
    }
    return [firstChunk].concat(chunkArray(array.slice(size, array.length), size));
}

interface IStorageItem {
    status: number;
    visited: boolean;
    isMissing: boolean;
    weight: number;
    depth: number;
}

interface IFnCallbackResponse {
    url: string;
    status: number;
    children: string[];
}

export default class HTTPLinkSearch {

    public queue: Set<string> = new Set([]);
    public storage: Map<string, IStorageItem> = new Map([]);
    private knownUrlString: string;
    private knownUrlObj: URL;
    private fnArray: Array<() => Promise<IFnCallbackResponse>> = [];
    private depth: number = 0;

    constructor(url: string) {
        this.knownUrlString = url;
        this.knownUrlObj = new URL(url);
        this.queue.add(url);
    }

    public search(maxDepth: number, fnCallback: (url: string, knownUrlObj: URL) => Promise<IFnCallbackResponse>): Promise<any> {

        const storage = this.storage;
        const queue = this.queue;

        if (queue.size === 0) {
            return Promise.reject(`Queue is empty. Add something to queue before searching.`);
        }

        if (this.depth > maxDepth) {
            return Promise.reject(`Maximum depth of ${maxDepth} reached.`);
        }

        this.fnArray = [...queue].map((nodeInQueue) => {
            queue.delete(nodeInQueue);
            return () => fnCallback(nodeInQueue, this.knownUrlObj);
        });

        const fnArrayBatches = chunkArray(this.fnArray, 2);

        const fnSequenceBatches = fnArrayBatches.map((fnArrayBatch) => {

            return () => parallelFnPromises(fnArrayBatch).then((result) => {
                result.forEach((nodeResult: IFnCallbackResponse) => {
                    const nodeResultRecord = storage.get(nodeResult.url);

                    if (nodeResultRecord) {
                        nodeResultRecord.status = nodeResult.status;
                        nodeResultRecord.visited = true;
                        storage.set(nodeResult.url, nodeResultRecord);
                    } else {
                        storage.set(nodeResult.url, {
                            status: nodeResult.status,
                            visited: true,
                            isMissing: false,
                            weight: 0,
                            depth: this.depth,
                        });
                    }

                    nodeResult.children.forEach((nodeChild: string) => {
                        const nodeChildRecord = storage.get(nodeChild);
                        if (nodeChildRecord) {
                            nodeChildRecord.weight += 1;
                            storage.set(nodeChild, nodeChildRecord);
                        } else {
                            storage.set(nodeChild, {
                                status: 0,
                                visited: false,
                                isMissing: false,
                                weight: 0,
                                depth: this.depth + 1,
                            });
                            queue.add(nodeChild);
                        }
                    });
                });
            });
        });

        return sequentialFnPromises(fnSequenceBatches).then(() => {
            this.depth += 1;

            if (queue.size > 0) {
                return this.search(maxDepth, fnCallback).catch((err) => {
                    console.log(err);
                });
            }
        });

    }
}

const myUrl = "https://www.isleofdinosaurs.com/";
const myURLObj = new URL(myUrl);
const startTime = Date.now();
const ls = new HTTPLinkSearch(myUrl);
ls.search(1, async (url: string, knownUrlObj: URL) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080});
    await page.goto(url, { waitUntil: ["load", "domcontentloaded", "networkidle0"] });
    await page.waitForSelector("body");
    let links: string[] = await page.evaluate(getAllDOMLinks);
    await page.close();
    await browser.close();

    links = filterLinks(links, knownUrlObj);

    console.log(url, "\n\n", "Links found on page:", links, "\n");

    return {
        url,
        status: 200,
        children: links,
    };
}).then(() => {
    const endTime = Date.now();
    console.log(`Done indexing.`);

    const report = {
        "Browser orchestrator": "puppeteer",
        "Browser batch size": 2,
        "Website": myUrl,
        "Process time": `${(endTime - startTime) / 1000}s`,
        "Links found": ls.storage.size,
        "Queue size": ls.queue.size,
        "Max. depth": 1,
    };
    console.table([report]);

    console.log(`Writing reports ...`);
    writeToFile(process.cwd(), `${myURLObj.host}-report.json`, JSON.stringify(report, null, "  "));
    writeToFile(process.cwd(), `${myURLObj.host}-storage.json`, JSON.stringify([...ls.storage], null, "  "));
    writeToFile(process.cwd(), `${myURLObj.host}-queue.json`, JSON.stringify([...ls.queue], null, "  "));

    console.log(`Done!`);
});
