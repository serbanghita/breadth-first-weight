import puppeteer from "puppeteer";

function log(...msgs: string[]) {
    console.log(msgs);
}

function sequentialFnPromises(tasks: Array<() => Promise<any>>) {
    return tasks.reduce((promiseChain: Promise<any[]>, currentTask: () => Promise<any>) => {
        return promiseChain.then((chainResults) =>
            currentTask().then((currentResult) => [...chainResults, currentResult]),
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

export interface IHttpCrawlerStorageItem {
    visited: boolean;
    isMissing: boolean;
    weight: number;
    depth: number;
    status: number;
    linksTotal: number;
    headers: Record<string, string>;
    metrics: Record<string, number>;
    errorMessage: string;
    errorCode: string;
    redirected: boolean;
    redirectStatus: number;
    redirectOriginalLocation: string;
    consoleEvents: IBrowserEventMessage[];
}

export interface IHttpCrawlerOptions {
    url: string;
    requestsPerBatch: number;
    linkDepth: number;
    linkLimit: number;
    knownHosts: string[];
    browserViewport: { width: number, height: number };
    ignoreLinkExtensions: string[];
    reportsPath: string;
}

export interface IHttpCrawlerResponse {
    url: string;
    status: number;
    links: string[];
    headers: Record<string, string>;
    metrics: Record<string, number>;
    errorMessage: string;
    errorCode: string;
    redirected: boolean;
    redirectStatus: number;
    redirectOriginalLocation: string;
    consoleEvents: IBrowserEventMessage[];
}

export type BrowserEventMessageLevel = "info" | "warning" | "error";
export type BrowserEventMessageType = "css" | "js" | "html" | "security" | "network" | "browser";
export interface IBrowserEventMessage {
    identifier: string;
    level: BrowserEventMessageLevel;
    type: BrowserEventMessageType;
    text: string;
    details: any;
}

export interface IHttpCrawlerMetrics extends puppeteer.Metrics {
    [metricName: string]: number;
}

export default class HttpCrawler {

    public queue: Set<string> = new Set([]);
    public storage: Map<string, IHttpCrawlerStorageItem> = new Map([]);
    private fnArray: Array<() => Promise<IHttpCrawlerResponse>> = [];
    private depth: number = 0;

    constructor(
        private options: IHttpCrawlerOptions,
        private requestFn: (url: string, options: IHttpCrawlerOptions) => Promise<IHttpCrawlerResponse>,
    ) {
        this.queue.add(options.url);
    }

    public search(): Promise<any> {

        const storage = this.storage;
        const queue = this.queue;

        const options = this.options;
        const linkDepth = options.linkDepth;
        const requestFn = this.requestFn;

        if (queue.size === 0) {
            return Promise.reject(new Error(`Queue is empty. Add something to queue before searching.`));
        }

        if (this.depth > linkDepth) {
            return Promise.reject(new Error(`Maximum depth of ${linkDepth} reached.`));
        }

        this.fnArray = [...queue].map((urlInQueue) => {
            queue.delete(urlInQueue);
            return () => requestFn(urlInQueue, options);
        });

        const fnArrayBatches = chunkArray(this.fnArray, options.requestsPerBatch);

        const fnSequenceBatches = fnArrayBatches.map((fnArrayBatch) => {
            return () => parallelFnPromises(fnArrayBatch).then((result) => {
                result.forEach((response: IHttpCrawlerResponse) => {
                    const nodeResultRecord = storage.get(response.url);

                    if (nodeResultRecord && nodeResultRecord.visited) {
                        log("Warning:", `${response.url} was already visited!`);
                        return;
                    }

                    storage.set(response.url, {
                        visited: true,
                        isMissing: false,
                        weight: 0,
                        depth: this.depth,
                        status: response.status,
                        linksTotal: response.links.length,
                        headers: response.headers,
                        metrics: response.metrics,
                        errorMessage: response.errorMessage,
                        errorCode: response.errorCode,
                        redirected: response.redirected,
                        redirectStatus: response.redirectStatus,
                        redirectOriginalLocation: response.redirectOriginalLocation,
                        consoleEvents: response.consoleEvents,
                    });

                    response.links.forEach((childLink: string) => {
                        const childLinkRecord = storage.get(childLink);
                        if (childLinkRecord) {
                            childLinkRecord.weight += 1;
                            storage.set(childLink, childLinkRecord);
                        } else {
                            storage.set(childLink, {
                                visited: false,
                                isMissing: false,
                                weight: 0,
                                depth: this.depth + 1,
                                status: 0,
                                linksTotal: 0,
                                headers: {},
                                metrics: {},
                                errorMessage: "",
                                errorCode: "",
                                redirected: false,
                                redirectStatus: 0,
                                redirectOriginalLocation: "",
                                consoleEvents: [],
                            });
                            queue.add(childLink);
                        }
                    });
                });
            });
        });

        return sequentialFnPromises(fnSequenceBatches).then(() => {
            this.depth += 1;

            if (queue.size > 0) {
                return this.search().catch((err) => {
                    console.log(err.message);
                });
            }
        });

    }
}
