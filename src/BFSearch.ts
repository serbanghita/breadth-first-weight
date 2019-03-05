import IListItem from "./items";

export interface IListItem {
    identifier: string;
    children: string[];
}

interface IStorageItem {
    visited: boolean;
    depth: number;
    weight: number;
}

export default class BFSearch {
    public storage: Map<string, IStorageItem> = new Map([]);
    public queue: Set<string> = new Set([]);

    constructor(public items: IListItem[]) {
        this.items = items;
    }

    public findItem(identifier: string): IListItem | undefined {
        return this.items.find((a: IListItem) => a.identifier === identifier);
    }

    public start(startIdentifier: string, maxDepth: number) {

        const startPage = this.findItem(startIdentifier);
        if (!startPage) {
            throw new Error(`Start page ${startIdentifier} was not found.`);
        }

        const storage = this.storage;
        let depth: number = 0;

        storage.set(startPage.identifier, {visited: true, depth, weight: 0});
        if (startPage.children.length > 0) {
            this.queue = new Set([...this.queue].concat(startPage.children));
        }

        while (this.queue.size > 0) {
            depth += 1;
            if (depth > maxDepth) {
                break;
            }
            this.queue.forEach((identifier: string) => {
                const childPage = this.findItem(identifier);
                if (!childPage) {
                    return;
                }

                const childPageRecord = storage.get(identifier);
                if (childPageRecord) {
                    childPageRecord.weight += 1;
                    storage.set(identifier, childPageRecord);
                } else {
                    storage.set(identifier, {visited: true, depth, weight: 0});
                }
                this.queue.delete(identifier);
                if (childPage.children) {
                    const newLinks = childPage.children.filter((childHref: string) => !storage.get(childHref));
                    this.queue = new Set([...this.queue].concat(newLinks));
                }
            });
        }
    }
}
