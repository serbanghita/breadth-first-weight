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

        expect(bfs.storage.size).toBe(6);
        expect(bfs.queue.size).toBe(2);

        // Check storage.
        expect(bfs.storage.has("/")).toBe(true);
        expect(bfs.storage.get("/")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/")).toHaveProperty("depth", 0);
        expect(bfs.storage.get("/")).toHaveProperty("weight", 3);

        expect(bfs.storage.has("/a")).toBe(true);
        expect(bfs.storage.get("/a")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/a")).toHaveProperty("depth", 1);
        expect(bfs.storage.get("/a")).toHaveProperty("weight", 3);

        expect(bfs.storage.has("/b")).toBe(true);
        expect(bfs.storage.get("/b")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/b")).toHaveProperty("depth", 1);
        expect(bfs.storage.get("/b")).toHaveProperty("weight", 3);

        expect(bfs.storage.has("/c")).toBe(true);
        expect(bfs.storage.get("/c")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/c")).toHaveProperty("depth", 1);
        expect(bfs.storage.get("/c")).toHaveProperty("weight", 3);

        expect(bfs.storage.has("/a/a")).toBe(true);
        expect(bfs.storage.get("/a/a")).toHaveProperty("visited", false);
        expect(bfs.storage.get("/a/a")).toHaveProperty("depth", 2);
        expect(bfs.storage.get("/a/a")).toHaveProperty("weight", 0);

        expect(bfs.storage.has("/b/a")).toBe(true);
        expect(bfs.storage.get("/b/a")).toHaveProperty("visited", false);
        expect(bfs.storage.get("/b/a")).toHaveProperty("depth", 2);
        expect(bfs.storage.get("/b/a")).toHaveProperty("weight", 0);

        // Check queue.
        const [aa, ba] = [...bfs.queue];
        expect(aa).toEqual("/a/a");
        expect(ba).toEqual("/b/a");

    });

    test.only("With depth 2", () => {
        const bfs = new BFSearch(itemsList);
        bfs.start("/", 2);

        console.log(bfs.storage);
        console.log(bfs.queue);

        expect(bfs.storage.size).toBe(7);
        expect(bfs.queue.size).toBe(1);

        // Check storage.
        expect(bfs.storage.has("/")).toBe(true);
        expect(bfs.storage.get("/")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/")).toHaveProperty("depth", 0);
        expect(bfs.storage.get("/")).toHaveProperty("weight", 4);

        expect(bfs.storage.has("/a")).toBe(true);
        expect(bfs.storage.get("/a")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/a")).toHaveProperty("depth", 1);
        expect(bfs.storage.get("/a")).toHaveProperty("weight", 4);

        expect(bfs.storage.has("/b")).toBe(true);
        expect(bfs.storage.get("/b")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/b")).toHaveProperty("depth", 1);
        expect(bfs.storage.get("/b")).toHaveProperty("weight", 4);

        expect(bfs.storage.has("/c")).toBe(true);
        expect(bfs.storage.get("/c")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/c")).toHaveProperty("depth", 1);
        expect(bfs.storage.get("/c")).toHaveProperty("weight", 4);

        // '/a/a' => { visited: true, depth: 2, weight: 0 },
        // '/b/a' => { visited: false, depth: 2, weight: 0 },
        // '/a/a/a' => { visited: false, depth: 3, weight: 0 } }

        // Check queue.
        const [aaa] = [...bfs.queue];
        expect(aaa).toEqual("/a/a/a");
    });

});
