export default class HttpCrawlerError extends Error {
    constructor(public code: string, ...params: any[]) {
        super(...params);

        this.code = code;
    }
}