import MemoryStorage, {IDBPage} from "./MemoryStorage";
import {getPage, IWebsitePage} from "./pages";
import {sequentialPromises} from "./queue";

async function findLinks(page: IWebsitePage, depth: number, maxDepth: number): Promise<any> {

    console.log(`findLinks for ${page.href} ${depth}`);

    // Get relevant info from DOM.
    const links: string[] = await getPageLinks(page);

    // Save link data to DB.
    db.save(page.href, true, depth, links.length);

    // For each links found, preliminary save them.
    links.forEach((link: string) => {
        db.save(link, false, depth, 0);
    });

    // New links need to be addressed.
    const findLinksPromisesArr = [...db.entries()]
        .filter((a: [string, IDBPage]) => !a[1].visited)
        .sort((a: [string, IDBPage], b: [string, IDBPage]) => {
            if (a[1].weight > b[1].weight) {
                return -1;
            } else if (a[1].weight < b[1].weight) {
                return 1;
            } else {
                return 0;
            }
        }).map((a: [string, IDBPage]) => {
            const [href, newPage] = a;
            const uncheckedPage = getPage(href);

            if (uncheckedPage) {
                return findLinks(uncheckedPage, newPage.depth + 1, maxDepth);
            } else {
                return Promise.reject(`No page found for ${href}.`);
            }
        });

    if (depth > maxDepth) {
        return [];
    }

    // return sequentialPromises(findLinksPromisesArr);
    return Promise.all(findLinksPromisesArr);
}

function getPageLinks(page: IWebsitePage): Promise<string[]> {
    return Promise.resolve(page.links);
}

const db = new MemoryStorage();

const homePage = getPage("/");
if (homePage) {
    findLinks(homePage, 0, 1).then(() => console.log(db.entries()));
}
