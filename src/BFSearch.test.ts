import BFSearch, {IListItem} from "./BFSearch";

describe("BFSearch",  () => {
    test("List of pages with depth 1", () => {
        const itemsList: IListItem[] = [
            {
                identifier: "/",
                children: [ "/a", "/b", "/c" ],
            },
            {
                identifier: "/a",
                children: [ "/a/a" ],
            },
            {
                identifier: "/a/a",
                children: [ "/a/a/a", "/a", "/b", "/c" ],
            },
            {
                identifier: "/a/a/a",
                children: [ ],
            },
            {
                identifier: "/b",
                children: [ "/b/a", "/a", "/b", "/c" ],
            },
            {
                identifier: "/c",
                children: [ "/a", "/b", "/c" ],
            },
        ];
        const bfs = new BFSearch(itemsList);
        bfs.start("/", 1);

        expect(bfs.storage.size).toBe(4);


        // expect(bfs.storage.has("/")).toBe(true);
        // expect(bfs.storage.get("/")).toHaveProperty("depth", 0);
        // expect(bfs.storage.get("/")).toHaveProperty("weight", 1);
        //
        // expect(bfs.storage.has("/a")).toBe(true);
        // expect(bfs.storage.get("/a")).toHaveProperty("depth", 1);
        // expect(bfs.storage.get("/a")).toHaveProperty("weight", 0);

    });

});

