export default class HttpCrawlerRuntimeError extends Error {
    constructor(public code: string, err: Error) {
        super(err.message);
        Error.captureStackTrace(this, this.constructor);
        this.code = code;
    }
}
