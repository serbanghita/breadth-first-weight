import BFSearch, {IListItem} from "./BFSearch";

describe("BFSearch",  () => {

    test("With missing item", () => {
        const itemsList: IListItem[] = [
            {
                identifier: "/",
                children: [ "/", "/a", "/b" ],
            },
            {
                identifier: "/a",
                children: [],
            },
        ];

        const bfs = new BFSearch(itemsList);
        bfs.search("/", 1);

        expect(bfs.storage.size).toBe(3);
        expect(bfs.queue.size).toBe(0);

        // Check storage.
        expect(bfs.storage.has("/")).toBe(true);
        expect(bfs.storage.get("/")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/")).toHaveProperty("depth", 0);
        expect(bfs.storage.get("/")).toHaveProperty("weight", 1);
        expect(bfs.storage.get("/")).toHaveProperty("isMissing", false);

        expect(bfs.storage.has("/a")).toBe(true);
        expect(bfs.storage.get("/a")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/a")).toHaveProperty("depth", 1);
        expect(bfs.storage.get("/a")).toHaveProperty("weight", 0);
        expect(bfs.storage.get("/a")).toHaveProperty("isMissing", false);

        expect(bfs.storage.has("/b")).toBe(true);
        expect(bfs.storage.get("/b")).toHaveProperty("visited", true);
        expect(bfs.storage.get("/b")).toHaveProperty("depth", 1);
        expect(bfs.storage.get("/b")).toHaveProperty("weight", 0);
        expect(bfs.storage.get("/b")).toHaveProperty("isMissing", true);

    });

    describe("Depth", () => {
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
                identifier: "/b/a",
                children: [ ],
            },
            {
                identifier: "/c",
                children: [ "/", "/a", "/b", "/c" ],
            },
        ];

        test("With depth 1", () => {

            const bfs = new BFSearch(itemsList);
            bfs.search("/", 1);

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

        test("With depth 2", () => {
            const bfs = new BFSearch(itemsList);
            bfs.search("/", 2);

            // console.log(bfs.storage);
            // console.log(bfs.queue);

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

            expect(bfs.storage.has("/a/a")).toBe(true);
            expect(bfs.storage.get("/a/a")).toHaveProperty("visited", true);
            expect(bfs.storage.get("/a/a")).toHaveProperty("depth", 2);
            expect(bfs.storage.get("/a/a")).toHaveProperty("weight", 0);

            expect(bfs.storage.has("/b/a")).toBe(true);
            expect(bfs.storage.get("/b/a")).toHaveProperty("visited", true);
            expect(bfs.storage.get("/b/a")).toHaveProperty("depth", 2);
            expect(bfs.storage.get("/b/a")).toHaveProperty("weight", 0);

            expect(bfs.storage.has("/a/a/a")).toBe(true);
            expect(bfs.storage.get("/a/a/a")).toHaveProperty("visited", false);
            expect(bfs.storage.get("/a/a/a")).toHaveProperty("depth", 3);
            expect(bfs.storage.get("/a/a/a")).toHaveProperty("weight", 0);

            // Check queue.
            const [aaa] = [...bfs.queue];
            expect(aaa).toEqual("/a/a/a");
        });

        test("With depth 10", () => {
            const itemsListTen: IListItem[] = [
                {
                    identifier: "/a",
                    children: [ "/a/1" ],
                },
                {
                    identifier: "/a/1",
                    children: [ "/a/1/2" ],
                },
                {
                    identifier: "/a/1/2",
                    children: [ "/a/1/2/3" ],
                },
                {
                    identifier: "/a/1/2/3",
                    children: [ "/a/1/2/3/4" ],
                },
                {
                    identifier: "/a/1/2/3/4",
                    children: [ "/a/1/2/3/4/5" ],
                },
                {
                    identifier: "/a/1/2/3/4/5",
                    children: [ "/a/1/2/3/4/5/6" ],
                },
                {
                    identifier: "/a/1/2/3/4/5/6",
                    children: [ "/a/1/2/3/4/5/6/7" ],
                },
                {
                    identifier: "/a/1/2/3/4/5/6/7",
                    children: [ "/a/1/2/3/4/5/6/7/8" ],
                },
                {
                    identifier: "/a/1/2/3/4/5/6/7/8",
                    children: [ "/a/1/2/3/4/5/6/7/8/9" ],
                },
                {
                    identifier: "/a/1/2/3/4/5/6/7/8/9",
                    children: [ "/a/1/2/3/4/5/6/7/8/9/10" ],
                },
                {
                    identifier: "/a/1/2/3/4/5/6/7/8/9/10",
                    children: [],
                },
            ];

            // Test with maxDepth = 10
            const bfs = new BFSearch(itemsListTen);
            bfs.search("/a", 10);

            expect(bfs.storage.size).toBe(11);
            expect(bfs.queue.size).toBe(0);

            bfs.storage.forEach((item) => {
                expect(item.visited).toBe(true);
                expect(item.isMissing).toBe(false);
            });

            // Test with maxDepth = 9
            bfs.search("/a", 9);
            expect(bfs.storage.size).toBe(11);
            expect(bfs.queue.size).toBe(1);

            expect(bfs.storage.get("/a/1/2/3/4/5/6/7/8/9/10")).toHaveProperty("visited", false);

        });
    });


});
