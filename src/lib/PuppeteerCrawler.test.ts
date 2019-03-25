import { __setMock } from "../__mocks__/puppeteer";
import { IHttpCrawlerOptions } from "./HttpCrawler";
import { requestHandleFn } from "./PuppeteerCrawler";

describe("PuppeteerCrawler", () => {

    afterAll(() => {
        jest.clearAllMocks();
    });

    describe("filterLinks", () => {

        it("non-string links are normalized to empty string and then removed", async () => {
            __setMock("filterLinks non-string");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };

            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 200);
            expect(response).toHaveProperty("links", []);
        });

        it("non-valid links are normalized and removed", async () => {
            __setMock("filterLinks non-valid");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };

            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 200);
            expect(response.links).toHaveLength(2);
            expect(response).toHaveProperty("links", ["http://test.com/", "http://test.com/a"]);
        });

        it("links with ignored file extensions are normalized and removed", async () => {
            __setMock("filterLinks ignored extensions");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: ["pdf", "doc", "gif"],
                reportsPath: "",
            };

            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 200);
            expect(response.links).toHaveLength(0);
        });

    });

    describe("requestHandleFn", () => {

        it("ERR_CREATE_BROWSER", async () => {
            __setMock("ERR_CREATE_BROWSER");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };
            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 0);
            expect(response).toHaveProperty("links", []);
            expect(response).toHaveProperty("headers", {});
            expect(response).toHaveProperty("metrics", {});
            expect(response).toHaveProperty("errorMessage", "Launch error");
            expect(response).toHaveProperty("errorCode", "ERR_CREATE_BROWSER");
        });

        it("ERR_CREATE_PAGE", async () => {
            __setMock("ERR_CREATE_PAGE");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };
            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 0);
            expect(response).toHaveProperty("links", []);
            expect(response).toHaveProperty("headers", {});
            expect(response).toHaveProperty("metrics", {});
            expect(response).toHaveProperty("errorMessage", "Creating browser error");
            expect(response).toHaveProperty("errorCode", "ERR_CREATE_PAGE");
        });

        it("ERR_SET_VIEWPORT", async () => {
            __setMock("ERR_SET_VIEWPORT");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };
            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 0);
            expect(response).toHaveProperty("links", []);
            expect(response).toHaveProperty("headers", {});
            expect(response).toHaveProperty("metrics", {});
            expect(response).toHaveProperty("errorMessage", "Cannot set the viewport");
            expect(response).toHaveProperty("errorCode", "ERR_SET_VIEWPORT");
        });

        it("ERR_OPEN_PAGE null", async () => {
            __setMock("ERR_OPEN_PAGE null");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };
            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 0);
            expect(response).toHaveProperty("links", []);
            expect(response).toHaveProperty("headers", {});
            expect(response).toHaveProperty("metrics", {});
            expect(response).toHaveProperty("errorMessage", "Request is null");
            expect(response).toHaveProperty("errorCode", "ERR_OPEN_PAGE");
        });

        it("ERR_OPEN_PAGE exception", async () => {
            __setMock("ERR_OPEN_PAGE exception");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };
            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 0);
            expect(response).toHaveProperty("links", []);
            expect(response).toHaveProperty("headers", {});
            expect(response).toHaveProperty("metrics", {});
            expect(response).toHaveProperty("errorMessage", "Request could not be performed");
            expect(response).toHaveProperty("errorCode", "ERR_OPEN_PAGE");
        });

        it("ERR_HTTP_ERROR 404", async () => {
            __setMock("ERR_HTTP_ERROR 404");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };
            const response = await requestHandleFn("http://test.com/404", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/404");
            expect(response).toHaveProperty("status", 404);
            expect(response).toHaveProperty("links", []);
            expect(response).toHaveProperty("headers", { "content-type": "text/html;charset=utf-8" });
            expect(response).toHaveProperty("metrics", {});
            expect(response).toHaveProperty("errorMessage", "HTTP Error");
            expect(response).toHaveProperty("errorCode", "ERR_HTTP_ERROR");
        });

        it("ERR_BODY_LOAD", async () => {
            __setMock("ERR_BODY_LOAD");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };
            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 200);
            expect(response).toHaveProperty("links", []);
            expect(response).toHaveProperty("headers", { "content-type": "text/html;charset=utf-8" });
            expect(response).toHaveProperty("metrics", {});
            expect(response).toHaveProperty("errorMessage", "Selector timeout");
            expect(response).toHaveProperty("errorCode", "ERR_BODY_LOAD");
        });

        it("ERR_GET_ALL_DOM_LINKS should be logged and ignored", async () => {
            __setMock("ERR_GET_ALL_DOM_LINKS");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };
            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 200);
            expect(response).toHaveProperty("links", []);
            expect(response).toHaveProperty("headers", { "content-type": "text/html;charset=utf-8" });
            expect(response).toHaveProperty("metrics", {});
            expect(response).toHaveProperty("errorMessage", "");
            expect(response).toHaveProperty("errorCode", "");
        });

        it("200 valid request", async () => {
            __setMock("200 valid request");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
                ignoredLinkExtensions: [],
                reportsPath: "",
            };
            const response = await requestHandleFn("http://test.com/", requestOptions);

            expect(response).toHaveProperty("url", "http://test.com/");
            expect(response).toHaveProperty("status", 200);
            expect(response).toHaveProperty("links", ["http://test.com/a", "http://test.com/b"]);
            expect(response).toHaveProperty("headers", { "content-type": "text/html;charset=utf-8" });
            expect(response).toHaveProperty("metrics", { Timestamp: 1 });
            expect(response).toHaveProperty("errorMessage", "");
            expect(response).toHaveProperty("errorCode", "");
        });

    });

});
