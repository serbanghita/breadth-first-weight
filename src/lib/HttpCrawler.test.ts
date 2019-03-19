import HttpCrawler, {IHttpCrawlerOptions, IResponse} from "./HttpCrawler";

describe("HttpCrawler", () => {

    it("constructor adds url option to the queue", () => {
        const cOpt = {
            url: "http://test.com",
            requestsPerBatch: 1,
            linkDepth: 0,
            linkLimit: 1,
            knownHosts: [],
            browserViewport: { width: 100, height: 100 },
        };
        const requestFn = (url: string, options: IHttpCrawlerOptions) => {
            return Promise.resolve({}) as Promise<IResponse>;
        };
        const c = new HttpCrawler(cOpt, requestFn);

        expect(c.queue.size).toEqual(1);
    });

});
