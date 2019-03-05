export interface IListItem {
    identifier: string;
    children: string[];
}

interface IStorageItem {
    visited: boolean;
    depth: number;
    weight: number;
}

interface IQueueItem {
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

    public start(identifier: string, maxDepth: number) {

        const storage = this.storage;
        const queue = this.queue;

        let depth: number = 0;
        let item = this.findItem(identifier);
        if (!item) {
            throw new Error(`Start page ${identifier} was not found.`);
        }

        queue.add(item.identifier);

        while (queue.size > 0) {
            if (depth > maxDepth) {
                break;
            }

            [...queue].forEach((itemIdentifier: string) => {
                item = this.findItem(itemIdentifier);
                if (!item) {
                    queue.delete(itemIdentifier);
                    return;
                }

                // At this step we're updating the item to mark it as visited.
                const itemRecord = storage.get(itemIdentifier);

                if (itemRecord) {
                    itemRecord.visited = true;
                    storage.set(itemIdentifier, itemRecord);
                } else {
                    storage.set(itemIdentifier, {visited: true, depth, weight: 0});
                }

                // No longer needed in queue.
                queue.delete(itemIdentifier);

                // At the next step check if item's children are repeating or new.
                // New children are added to the queue.
                if (item.children) {
                    item.children.forEach((childItemIdentifier: string) => {
                        const childItemRecord = storage.get(childItemIdentifier);

                        // If we find an existing item we just increase it's weight.
                        // There is no need to re-add it to queue.
                        if (childItemRecord) {
                            childItemRecord.weight += 1;
                            storage.set(childItemIdentifier, childItemRecord);
                        } else {
                            storage.set(childItemIdentifier, {visited: false, depth: depth + 1, weight: 0});
                            queue.add(childItemIdentifier);
                        }
                    });
                }
            });

            depth += 1;
        }

    }
}
