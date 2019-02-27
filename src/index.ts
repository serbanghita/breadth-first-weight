import {getPage, IWebsitePage} from "./pages";
import MemoryStorage, {IDBPage} from "./MemoryStorage";








async function findLinks(page: IWebsitePage, depth: number) {

    const title: string = await getPageTitle(page);
    const links: string[] = await getPageLinks(page);

    db.save(page.href, title, true, depth, links.length);

    links.forEach((link: string) => {
        db.save(link, "", false, depth, 0);
    });

    // New links need to be addressed.
    [...db.entries()]
        .filter((a: [string, IDBPage]) => !a[1].visited)
        .sort((a: [string, IDBPage], b: [string, IDBPage]) => {
            if (a[1].weight > b[1].weight) {
                return -1;
            } else if (a[1].weight < b[1].weight) {
                return 1;
            } else {
                return 0;
            }
        }).forEach((a: [string, IDBPage]) => {
            const uncheckedPage = getPage(a[0]);
            if (uncheckedPage) {
                findLinks(uncheckedPage, ++a[1].depth);
            }
        });

}

function getPageTitle(page: IWebsitePage): Promise<string> {
    return Promise.resolve(page.title);
}

function getPageLinks(page: IWebsitePage): Promise<string[]> {
    return Promise.resolve(page.links);
}

const db = new MemoryStorage();

const homePage = getPage("/");
if (homePage) {
    findLinks(homePage, 0).then(() => console.log(db.entries()));

}
