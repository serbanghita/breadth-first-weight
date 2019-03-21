export default class HttpCrawlerContentError extends Error {
    constructor(public code: string, err: Error) {
        super(err.message);
        Error.captureStackTrace(this, this.constructor);
        this.code = code;
    }
}
