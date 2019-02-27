export interface IDBPage {
    title: string;
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

    public save(href: string, title: string, visited: boolean, depth: number, linksNo?: number) {
        const linkResult = this.get(href);
        if (linkResult) {
            this.update(href, title, depth, linksNo);
        } else {
            this.insert(href, title, true, depth, linksNo || 0);
        }
    }

    public update(href: string, title: string, depth: number, linksNo?: number) {
        const pageDetails = this.db.get(href);

        if (!pageDetails) {
            return;
        }

        if (!pageDetails.title) {
            pageDetails.title = title;
        }
        pageDetails.visited = true;
        pageDetails.weight += 1;
        pageDetails.depth = depth;
        if (typeof linksNo !== "undefined") {
            pageDetails.linksNo = linksNo;
        }

        this.db.set(href, pageDetails);
    }

    public insert(href: string, title: string, visited: boolean, depth: number, linksNo: number) {
        const pageDetails = {
            title, href, visited, weight: 1, depth, linksNo,
        };

        this.db.set(href, pageDetails);
    }

    public get(href: string) {
        return this.db.get(href);
    }
}
