import {Response} from "puppeteer";

export default class HttpCrawlerContentError extends Error {
    constructor(public code: string, public response: Response, err: Error) {
        super(err.message);
        Error.captureStackTrace(this, this.constructor);
        this.code = code;
        this.response = response;
    }
}
