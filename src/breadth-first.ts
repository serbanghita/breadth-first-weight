import {getPage, IWebsitePage} from "./pages";

interface IPageStore {
    visited: boolean;
    depth: number;
    weight: number;
}

class BreadthFirstSearchOnPages {
    public storage: Map<string, IPageStore> = new Map([]);
    public queue: Set<string> = new Set([]);

    public start(startHref: string, maxDepth: number) {

        const startPage = getPage(startHref);
        if (!startPage) {
            throw new Error(`Start page ${startHref} was not found.`);
        }

        const storage = this.storage;
        let depth: number = 0;

        storage.set(startPage.href, {visited: true, depth, weight: 0});
        if (startPage.links.length > 0) {
            this.queue = new Set([...this.queue].concat(startPage.links));
        }

        while (this.queue.size > 0) {
            depth += 1;
            if (depth > maxDepth) {
                break;
            }
            this.queue.forEach((href: string) => {
                const childPage = getPage(href);
                if (!childPage) {
                    return;
                }

                const childPageRecord = storage.get(href);
                if (childPageRecord) {
                    childPageRecord.weight += 1;
                    storage.set(href, childPageRecord);
                } else {
                    storage.set(href, {visited: true, depth, weight: 0});
                }
                this.queue.delete(href);
                if (childPage.links) {
                    const newLinks = childPage.links.filter((childHref: string) => !storage.get(childHref));
                    this.queue = new Set([...this.queue].concat(newLinks));
                }
            });
        }
    }
}

// Bootstrap
const a = new BreadthFirstSearchOnPages();
a.start("/", 2);

console.log(a.storage);
console.log(a.queue);

// Map {
//     '/' => { visited: true, depth: 0, weight: 1 },
//     '/a' => { visited: true, depth: 1, weight: 0 },
//     '/b' => { visited: true, depth: 1, weight: 0 },
//     '/c' => { visited: true, depth: 1, weight: 0 },
//     '/d' => { visited: true, depth: 1, weight: 0 },
//     '/b/a' => { visited: true, depth: 2, weight: 0 },
//     '/d/a' => { visited: true, depth: 2, weight: 0 },
//     '/d/b' => { visited: true, depth: 2, weight: 0 },
//     '/d/c' => { visited: true, depth: 2, weight: 0 },
//     '/d/d' => { visited: true, depth: 2, weight: 0 } }
// Set { '/d/a/a', '/d/b/a' }
