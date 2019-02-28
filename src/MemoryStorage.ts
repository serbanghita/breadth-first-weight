export interface IDBPage {
    href: string;
    visited: boolean;
    weight: number;
    depth: number;
    linksNo: number;
}

export default class MemoryStorage {
    private db: Map<string, IDBPage> = new Map([]);

    public entries() {
        return this.db.entries();
    }

    public save(href: string, visited: boolean, depth: number, linksNo?: number) {
        const linkResult = this.get(href);
        if (linkResult) {
            this.update(href, depth, linksNo);
        } else {
            this.insert(href, false, depth, linksNo || 0);
        }
    }

    public update(href: string, depth: number, linksNo?: number) {
        const pageDetails = this.db.get(href);

        if (!pageDetails) {
            return;
        }

        pageDetails.visited = true;
        pageDetails.weight += 1;
        pageDetails.depth = depth;
        if (typeof linksNo !== "undefined") {
            pageDetails.linksNo = linksNo;
        }

        this.db.set(href, pageDetails);
    }

    public insert(href: string, visited: boolean, depth: number, linksNo: number) {
        const pageDetails = {
            href, visited, weight: 1, depth, linksNo,
        };

        this.db.set(href, pageDetails);
    }

    public get(href: string) {
        return this.db.get(href);
    }
}
