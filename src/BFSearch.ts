export interface IListItem {
    identifier: string;
    children: string[];
}

export interface IStorageItem {
    visited: boolean;
    isMissing: boolean;
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

    public clear() {
        this.storage.clear();
        this.queue.clear();
    }

    public search(identifier: string, maxDepth: number) {

        // Each search clears the previous results.
        this.clear();

        const storage = this.storage;
        const queue = this.queue;

        let depth: number = 0;

        // Add to queue the initial item.
        // This is a particularity of HTTP crawling where you can
        // start discovering links from any entry point (link) from
        // a website and not necessary the first node in the graph.
        queue.add(identifier);

        while (queue.size > 0) {
            if (depth > maxDepth) {
                break;
            }

            [...queue].forEach((itemIdentifier: string) => {
                const item = this.findItem(itemIdentifier);

                // If the item doesn't exist in the list:
                // - save the status to storage
                // - exit the current iteration
                if (!item) {
                    storage.set(itemIdentifier, { visited: true, depth, weight: 0, isMissing: true});
                    queue.delete(itemIdentifier);
                    return;
                }

                // At this step we're updating the item to mark it as visited.
                const itemRecord = storage.get(itemIdentifier);

                if (itemRecord) {
                    itemRecord.visited = true;
                    storage.set(itemIdentifier, itemRecord);
                } else {
                    storage.set(itemIdentifier, {visited: true, depth, weight: 0, isMissing: false});
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
                            storage.set(childItemIdentifier, {visited: false, depth: depth + 1, weight: 0, isMissing: false});
                            queue.add(childItemIdentifier);
                        }
                    });
                }
            });

            depth += 1;
        }

    }
}
