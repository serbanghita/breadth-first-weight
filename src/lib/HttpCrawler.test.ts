import HttpCrawler, { IHttpCrawlerOptions, IHttpCrawlerResponse } from "./HttpCrawler";

describe("HttpCrawler", () => {

    it("constructor adds url option to the queue", () => {
        const cOpt: IHttpCrawlerOptions = {
            url: "http://test.com",
            requestsPerBatch: 1,
            linkDepth: 0,
            linkLimit: 1,
            knownHosts: [],
            browserViewport: { width: 100, height: 100 },
            ignoreLinkExtensions: [],
            reportsPath: "",
        };
        const requestFn = (url: string, options: IHttpCrawlerOptions) => {
            return Promise.resolve({}) as Promise<IHttpCrawlerResponse>;
        };
        const c = new HttpCrawler(cOpt, requestFn);

        expect(c.queue.size).toEqual(1);
    });

    describe("search", () => {
        it("visiting with linkDepth 0", async () => {
            const cOpt: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 1,
                knownHosts: [],
                browserViewport: { width: 100, height: 100 },
                ignoreLinkExtensions: [],
                reportsPath: "",
            };
            let requestFnCalls = 0;
            const requestFn = (url: string, options: IHttpCrawlerOptions) => {
                requestFnCalls++;
                return Promise.resolve({
                    url,
                    status: 200,
                    links: ["http://test.com/a", "http://test.com/b"],
                }) as Promise<IHttpCrawlerResponse>;
            };
            const c = new HttpCrawler(cOpt, requestFn);
            await c.search();

            expect(requestFnCalls).toEqual(1);
            expect(c.storage.size).toEqual(3);
            expect(c.queue.size).toEqual(2);
            expect(c.storage.get("http://test.com")).toHaveProperty("visited", true);
            expect(c.storage.get("http://test.com/a")).toHaveProperty("visited", false);
            expect(c.storage.get("http://test.com/b")).toHaveProperty("visited", false);
        });

        it("visiting with linkDepth 1", async () => {
            function linkGenerator(link: string) {
                const links: { [parentLink: string]: string[] } = {
                    "http://test.com": ["http://test.com/a", "http://test.com/b"],
                    "http://test.com/a": ["http://test.com/a/a", "http://test.com/a/b"],
                    "http://test.com/b": ["http://test.com/b/a", "http://test.com/b/b"],
                };

                return links[link];
            }

            const cOpt: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 1,
                linkLimit: 99,
                knownHosts: [],
                browserViewport: { width: 100, height: 100 },
                ignoreLinkExtensions: [],
                reportsPath: "",
            };
            let requestFnCalls = 0;
            const requestFn = (url: string, options: IHttpCrawlerOptions) => {
                requestFnCalls++;
                return Promise.resolve({
                    url,
                    status: 200,
                    links: linkGenerator(url),
                }) as Promise<IHttpCrawlerResponse>;
            };
            const c = new HttpCrawler(cOpt, requestFn);
            await c.search();

            expect(requestFnCalls).toEqual(3);
            expect(c.storage.size).toEqual(7);
            expect(c.queue.size).toEqual(4);
            expect(c.storage.get("http://test.com")).toHaveProperty("visited", true);
            expect(c.storage.get("http://test.com/a")).toHaveProperty("visited", true);
            expect(c.storage.get("http://test.com/b")).toHaveProperty("visited", true);
            expect(c.storage.get("http://test.com/a/a")).toHaveProperty("visited", false);
            expect(c.storage.get("http://test.com/a/b")).toHaveProperty("visited", false);
            expect(c.storage.get("http://test.com/b/a")).toHaveProperty("visited", false);
            expect(c.storage.get("http://test.com/b/b")).toHaveProperty("visited", false);

        });

        it("requestFn responds with a different URL", async () => {
            const cOpt: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 99,
                knownHosts: [],
                browserViewport: { width: 100, height: 100 },
                ignoreLinkExtensions: [],
                reportsPath: "",
            };
            let requestFnCalls = 0;
            const requestFn = (url: string, options: IHttpCrawlerOptions) => {
                requestFnCalls++;
                return Promise.resolve({
                    url: "http://test.com/something-else",
                    status: 200,
                    links: ["http://test.com/a", "http://test.com/b"],
                }) as Promise<IHttpCrawlerResponse>;
            };
            const c = new HttpCrawler(cOpt, requestFn);
            await c.search();

            expect(requestFnCalls).toEqual(1);
            expect(c.storage.size).toEqual(3);
            expect(c.queue.size).toEqual(2);

            expect(c.storage.get("http://test.com/something-else")).toHaveProperty("visited", true);

        });
    });


});
