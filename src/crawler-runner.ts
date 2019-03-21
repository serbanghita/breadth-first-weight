#!/usr/bin/env node
import * as path from "path";
import {getBorderCharacters, table} from "table";
import {URL} from "url";
import yargs from "yargs";
import {createDir, writeToFile} from "./lib/FileSystem";
import {default as HttpCrawler} from "./lib/HttpCrawler";
import {requestHandleFn} from "./lib/PuppeteerCrawler";

/**
 * CLI Usage: node build/crawler-runner.js -u="https://www.mercedes-benz.ro" -d=0 -b=6
 */

const cliOptions = yargs.usage("Usage: node ./bin/index.js [options]")
    .option(
        "url",
        {
            alias: "u",
            describe: "URL to start the crawling.",
            requiresArg: true,
            type: "string",
        },
    )
    .option(
        "requestsPerBatch",
        {
            alias: "b",
            describe: "Requests to perform per batch.",
            requiresArg: true,
            type: "number",
        },
    )
    .option(
        "linkDepth",
        {
            alias: "d",
            describe: "Depth of crawling the website.",
            requiresArg: true,
            type: "number",
        },
    )
    .help()
    .argv;

if (
    !cliOptions.url ||
    (typeof cliOptions.linkDepth !== "number") ||
    !cliOptions.requestsPerBatch || (typeof cliOptions.requestsPerBatch === "number" && cliOptions.requestsPerBatch <= 0)
) {
    console.log(cliOptions);
    throw new Error(`Mandatory CLI arguments missing.`);
}

const crawlerOptions = {
    url: cliOptions.url,
    // url: "http://serban.ghita.org",
    // url: "https://www.mercedes-benz.ro/passengercars/mercedes-benz-cars/models/eqc/registration.html/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/passengercars/buy/fleet-and-business/target-groups/diplomatic-sales",
    // url: "https://www.mercedes-benz.ro/",
    // url: "http://demo.mobiledetect.net/test-redirect-302.php",
    requestsPerBatch: cliOptions.requestsPerBatch,
    linkDepth: cliOptions.linkDepth,
    linkLimit: 9999,
    knownHosts: [""],
    browserViewport: { width: 1920, height: 1080 },
    ignoreLinkExtensions: ["pdf", "doc", "xls", "zip", "rar", "txt", "jpg", "png", "gif"],
    reportsPath: path.join(process.cwd(), "reports", (new URL(cliOptions.url)).host, Date.now().toString()),
};

createDir(crawlerOptions.reportsPath);

const crawlerInstance = new HttpCrawler(crawlerOptions, requestHandleFn);

const startTime = Date.now();
const startMem = process.memoryUsage();

crawlerInstance.search().then(() => {
    const endTime = Date.now();
    const endMem = process.memoryUsage();

    console.log(`Done indexing.`);
    const urlObj = new URL(crawlerOptions.url);

    const memoryReport = [
        `Total Heap: ${Math.round((endMem.heapTotal - startMem.heapTotal) / 1024 / 1024 * 100) / 100} MB`,
        `Heap used: ${Math.round((endMem.heapUsed - startMem.heapUsed) / 1024 / 1024 * 100) / 100} MB`,
        `RSS: ${Math.round((endMem.rss - startMem.rss) / 1024 / 1024 * 100) / 100} MB`,
    ];

    const report = [
        ["Browser \norchestrator", "Browser batch", "Website",
            "Process \ntime", "Memory report", "Links \nfound",
            "Queue \nsize", "Max. \ndepth"],
        ["puppeteer", crawlerOptions.requestsPerBatch, urlObj.host, `${(endTime - startTime) / 1000}s`,
            memoryReport.join("\n"), crawlerInstance.storage.size, crawlerInstance.queue.size, crawlerOptions.linkDepth],
        ];
    const reportConfig = {
        columnDefault: { width: 15 },
        border: getBorderCharacters("ramac"),
        columns: {
            1: { width: 7 },
            2: { width: 25 },
            3: { width: 7 },
            4: { width: 20 },
            5: { width: 7 },
            6: { width: 7 },
            7: { width: 7 },
        },
    };

    console.table(table(report, reportConfig));

    console.log(`Writing reports ...`);

    writeToFile(crawlerOptions.reportsPath, `report.json`, JSON.stringify(report, null, "  "));
    writeToFile(crawlerOptions.reportsPath, `storage.json`, JSON.stringify([...crawlerInstance.storage], null, "  "));
    writeToFile(crawlerOptions.reportsPath, `queue.json`, JSON.stringify([...crawlerInstance.queue], null, "  "));

    console.log(`Done!`);
    process.exit(0);
});
