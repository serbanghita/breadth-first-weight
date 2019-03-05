import BFSearch, {IListItem} from "./BFSearch";

describe("BFSearch",  () => {
    const itemsList: IListItem[] = [
        {
            identifier: "/",
            children: [ "/a", "/b", "/c" ],
        },
        {
            identifier: "/a",
            children: [ "/a/a", "/", "/a", "/b", "/c" ],
        },
            {
                identifier: "/a/a",
                children: [ "/a/a/a", "/", "/a", "/b", "/c" ],
            },
                {
                    identifier: "/a/a/a",
                    children: [ ],
                },
        {
            identifier: "/b",
            children: [ "/b/a", "/", "/a", "/b", "/c" ],
        },
        {
            identifier: "/c",
            children: [ "/", "/a", "/b", "/c" ],
        },
    ];

    test("With depth 1", () => {

        const bfs = new BFSearch(itemsList);
        bfs.start("/", 1);

        expect(bfs.storage.size).toBe(1);
        expect(bfs.queue.size).toBe(3);

        // Check storage.
        expect(bfs.storage.has("/")).toBe(true);
        expect(bfs.storage.get("/")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/")).toHaveProperty("depth", 1);
        expect(bfs.storage.get("/")).toHaveProperty("weight", 0);

        // Check queue.
        const [a, b, c] = [...bfs.queue];
        expect(a).toEqual("/a");
        expect(b).toEqual("/b");
        expect(c).toEqual("/c");

    });

    test("With depth 2", () => {
        const bfs = new BFSearch(itemsList);
        bfs.start("/", 2);

        console.log(bfs.storage);
        console.log(bfs.queue);

        expect(bfs.storage.size).toBe(4);
        expect(bfs.queue.size).toBe(2);

        // Check storage.
        expect(bfs.storage.has("/")).toBe(true);
        expect(bfs.storage.get("/")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/")).toHaveProperty("depth", 1);
        expect(bfs.storage.get("/")).toHaveProperty("weight", 3);

        expect(bfs.storage.has("/a")).toBe(true);
        expect(bfs.storage.get("/a")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/a")).toHaveProperty("depth", 2);
        expect(bfs.storage.get("/a")).toHaveProperty("weight", 3);

        expect(bfs.storage.has("/b")).toBe(true);
        expect(bfs.storage.get("/b")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/b")).toHaveProperty("depth", 2);
        expect(bfs.storage.get("/b")).toHaveProperty("weight", 2);

        expect(bfs.storage.has("/c")).toBe(true);
        expect(bfs.storage.get("/c")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/c")).toHaveProperty("depth", 2);
        expect(bfs.storage.get("/c")).toHaveProperty("weight", 1);

        // Check queue.
        const [aa, ba] = [...bfs.queue];
        expect(aa).toEqual("/a/a");
        expect(ba).toEqual("/b/a");
    });

});
