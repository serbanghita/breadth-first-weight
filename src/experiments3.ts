// import {debug} from "util";
//
// async function getPage(targetURL, pageWidth, pageHeight, useragent) {
//
//     // set the user agent
//     const userAgent = useragent;
//     // grab an instance of the Chrome headless browser
//     const browser = await global.chromepool.acquire();
//     debug(`GLOBAL CHROMEPOOL count after borrowing instance: ${global.chromepool.borrowed} for: ${targetURL}`);
//     // create a new page / tab
//     const page = await browser.newPage().catch((err) => errHandler("newPage", err, targetURL, browser) );
//     // set the viewport to equal the size of the user's viewport so that resources are equivalent
//     await page.setViewport({width: pageWidth, height: pageHeight}).catch((err) => errHandler("setViewport", err, targetURL, browser) );
//     // set the user agent in the browser
//     await page.setUserAgent(userAgent).catch((err) => errHandler("setUserAgent", err, targetURL, browser) );
//     // call the get content promise and attach a global handler for errors at any point
//     let content = await returnContent(targetURL, page, browser).catch((err) => { throw new Error(`${err}`); });
//     return content;
//
// }
//
// function errHandler(caller, error, targetURL, browser) {
//
//     if (global.chromepool.isBorrowedResource(browser) == true) {
//         global.chromepool.release(browser).then( () => {
//             debug(`GLOBAL CHROMEPOOL count after releasing instance: ${global.chromepool.borrowed}, on GENERAL ERROR: ${error.message.toUpperCase()}, in command: ${caller}, for: ${targetURL}`);
//             throw new Error(`${error}`);
//         });
//     } else { throw new Error(`${error}`); }
//
// }
//
// function returnContent(targetURL, page, browser) {
//
//     let returnedContent = null;
//     return new Promise( (resolve, reject) => {
//
//         page.on("error", (err) => {
//             if (global.chromepool.isBorrowedResource(browser) == true) {
//                 global.chromepool.release(browser).then( () => {
//                     debug(`GLOBAL CHROMEPOOL count after releasing instance: ${global.chromepool.borrowed}, on PAGE ERROR: ${err.message.toUpperCase()}, for: ${targetURL}`);
//                     reject(err);
//                 });
//             } else { reject(err); }
//         });
//
//         page.goto(targetURL, {timeout: 25000, waitUntil: ["domcontentloaded", "load"]})
//             .then( () => page.content() )
//             .then((content) => { returnedContent = content; })
//             .then( () => page.close() )
//             .then( () => global.chromepool.release(browser) )
//             .then( () => debug(`GLOBAL CHROMEPOOL count after releasing instance: ${global.chromepool.borrowed}, for: ${targetURL}`) )
//             .then( () => { resolve({targetURL, content: returnedContent}); })
//             .catch((err) => {
//                 if (global.chromepool.isBorrowedResource(browser) == true) {
//                     global.chromepool.release(browser).then( () => {
//                         debug(`GLOBAL CHROMEPOOL count after releasing instance: ${global.chromepool.borrowed}, on CONTENT ERROR: ${err.message.toUpperCase()}, for: ${targetURL}`);
//                         reject(err);
//                     });
//                 } else { reject(err); }
//             });
//     });
//
// }
