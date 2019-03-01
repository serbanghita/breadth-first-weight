import BreadthFirstSearchOnPages from "./breadth-first";

test("List of pages with depth 1", () => {
    const a = new BreadthFirstSearchOnPages();
    a.start("/", 1);
    expect(a.storage.has("/")).toBe(true);
    expect(a.storage.get("/")).toHaveProperty("depth", 0);
    expect(a.storage.get("/")).toHaveProperty("weight", 1);

    expect(a.storage.has("/a")).toBe(true);
    expect(a.storage.get("/a")).toHaveProperty("depth", 1);
    expect(a.storage.get("/a")).toHaveProperty("weight", 0);

    
});
