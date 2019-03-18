import {__setMock} from "../__mocks__/puppeteer";
import {IHttpCrawlerOptions} from "./HttpCrawler";
import {requestHandleFn} from "./PuppeteerCrawler";

describe("PuppeteerCrawler", () => {

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

        it("ERR_OPEN_PAGE null", async () => {
            __setMock("ERR_OPEN_PAGE null");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
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

        it("ERR_HTTP_ERROR 404", async () => {
            __setMock("ERR_HTTP_ERROR 404");

            const requestOptions: IHttpCrawlerOptions = {
                url: "http://test.com",
                requestsPerBatch: 1,
                linkDepth: 0,
                linkLimit: 999,
                knownHosts: [],
                browserViewport: { width: 1920, height: 1080 },
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

    });

});
