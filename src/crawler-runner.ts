import {URL} from "url";
import {writeToFile} from "./lib/FileSystem";
import {default as HttpCrawler, IHttpCrawlerOptions} from "./lib/HttpCrawler";
import {requestHandleFn} from "./lib/PuppeteerCrawler";

const cOptions = {
    // url: "http://serban.ghita.org",
    // url: "https://www.mercedes-benz.ro/passengercars/mercedes-benz-cars/models/eqc/registration.html/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/diplomatic-sales",
    // url: "https://www.mercedes-benz.ro/",
    url: "https://www.isleofdinosaurs.com",
    requestsPerBatch: 1,
    linkDepth: 0,
    linkLimit: 9999,
    knownHosts: ["ghita.org"],
    browserViewport: { width: 1920, height: 1080 },
};
const cInstance = new HttpCrawler(cOptions, requestHandleFn);

const startTime = Date.now();
const startMem = process.memoryUsage();

cInstance.search().then((options: IHttpCrawlerOptions) => {
    const endTime = Date.now();
    const endMem = process.memoryUsage();

    console.log(`Done indexing.`);
    const urlObj = new URL(options.url);

    const memoryReport = [
        `Total Heap: ${Math.round((endMem.heapTotal - startMem.heapTotal) / 1024 / 1024 * 100) / 100} MB`,
        `Heap used: ${Math.round((endMem.heapUsed - startMem.heapUsed) / 1024 / 1024 * 100) / 100} MB`,
        `RSS: ${Math.round((endMem.rss - startMem.rss) / 1024 / 1024 * 100) / 100} MB`,
    ];

    const report = {
        "Browser orchestrator": "puppeteer",
        "Browser batch size": options.requestsPerBatch,
        "Website": urlObj.host,
        "Process time": `${(endTime - startTime) / 1000}s`,
        "Memory report": memoryReport.join(" "),
        "Links found": cInstance.storage.size,
        "Queue size": cInstance.queue.size,
        "Max. depth": options.linkDepth,
    };
    console.table([report]);

    console.log(`Writing reports ...`);
    writeToFile(process.cwd(), `${urlObj.host}-report.json`, JSON.stringify(report, null, "  "));
    writeToFile(process.cwd(), `${urlObj.host}-storage.json`, JSON.stringify([...cInstance.storage], null, "  "));
    writeToFile(process.cwd(), `${urlObj.host}-queue.json`, JSON.stringify([...cInstance.queue], null, "  "));

    console.log(`Done!`);
});
