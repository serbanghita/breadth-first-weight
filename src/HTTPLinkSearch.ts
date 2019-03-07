import {IStorageItem} from "./BFSearch";

interface IPageResult {
    url: string;
    href: string;
    httpStatusCode: number;
    httpResponseHeaders: {};
    links: string[];
}

interface IStoragePage extends IStorageItem {
    url: string;
    href: string;
    httpStatusCode: number;
    httpResponseHeaders: {};
    linksFound: number;
}

export default class HTTPLinkSearch {
    public storage: Map<string, IStoragePage> = new Map([]);
    public queue: Set<string> = new Set([]);

    public async findPage(identifier: string): Promise<IPageResult> {
        const pageResult = await this.fetchPageResult(identifier);

        return pageResult;
    }

    public clear() {
        this.storage.clear();
        this.queue.clear();
    }

    public async search(identifier: string, maxDepth: number) {

        this.clear();

        const storage = this.storage;
        const queue = this.queue;

        let depth: number = 0;

        queue.add(identifier);

        while (queue.size > 0) {
            if (depth > maxDepth) {
                break;
            }

            [...queue].forEach(async (itemIdentifier: string) => {
                // Fetch data from item.
                const item = await this.findPage(itemIdentifier);

                console.log(itemIdentifier);
                console.log(item);

                // Missing pages are saved and removed from queue.
                if (item.httpStatusCode >= 400) {
                    storage.set(itemIdentifier, {
                        url: item.url,
                        href: item.href,
                        httpStatusCode: item.httpStatusCode,
                        httpResponseHeaders: item.httpResponseHeaders,
                        linksFound: 0,
                        visited: true,
                        isMissing: true,
                        depth,
                        weight: 0,
                    });
                    queue.delete(itemIdentifier);
                    return;
                }

                // Save to storage.
                storage.set(itemIdentifier, {
                    url: item.url,
                    href: item.href,
                    httpStatusCode: item.httpStatusCode,
                    httpResponseHeaders: item.httpResponseHeaders,
                    linksFound: item.links.length,
                    visited: true,
                    isMissing: false,
                    depth,
                    weight: 0,
                });

                // Delete from queue.
                queue.delete(itemIdentifier);

                // Add only new items to queue.
                // Update the weight for existing ones.
                item.links.forEach((childItemIdentifier: string) => {
                    const childItem = storage.get(childItemIdentifier);
                    if (childItem) {
                        childItem.weight += 1;
                        storage.set(childItemIdentifier, childItem);
                    } else {
                        storage.set(childItemIdentifier, {
                            url: childItemIdentifier,
                            href: "",
                            httpStatusCode: 0,
                            httpResponseHeaders: {},
                            linksFound: 0,
                            visited: false,
                            isMissing: false,
                            depth: depth + 1,
                            weight: 0,
                        });
                    }
                });
            });

            depth += 1;

        }

        return;

    }

    private fetchPageResult(url: string): Promise<IPageResult> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    url,
                    href: "/",
                    httpStatusCode: 200,
                    httpResponseHeaders: {},
                    links: ["/a", "/b"],
                });
            }, Math.floor(Math.random() * Math.floor(1000)));
        });
    }
}