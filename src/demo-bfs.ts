// Bootstrap
import BFSearch, {IListItem} from "./BFSearch";

const websiteLinks: IListItem[] = [
    {
        identifier: "/",
        children: [ "/", "/a", "/b", "/c", "/d" ],
    },
    {
        identifier: "/a",
        children: [ "/", "/a", "/b", "/c", "/d" ],
    },
    {
        identifier: "/b",
        children: [ "/", "/a", "/b", "/b/a", "/c", "/d" ],
    },
        {
            identifier: "/b/a",
            children: [ "/", "/a", "/b", "/c", "/d" ],
        },
            {
                identifier: "/b/a/a",
                children: [ "/b/a/a/a" ],
            },
                {
                    identifier: "/b/a/a/a",
                    children: [],
                },
    {
        identifier: "/c",
        children: [ "/", "/a", "/b", "/c", "/d" ],
    },
    {
        identifier: "/d",
        children: [ "/", "/a", "/b", "/c", "/d", "/d/a", "/d/b", "/d/c", "/d/d" ],
    },
        {
            identifier: "/d/a",
            children: [ "/", "/a", "/b", "/c", "/d", "/d/a/a" ],
        },
            {
                identifier: "/d/a/a",
                children: [ ],
            },
        {
            identifier: "/d/b",
            children: [ "/d/b/a" ],
        },
            {
                identifier: "/d/b/a",
                children: [ "/d/b/a/a", "/d/b/a/b" ],
            },
                {
                    identifier: "/d/b/a/a",
                    children: [ ],
                },
                {
                    identifier: "/d/b/a/b",
                    children: [ ],
                },
        {
            identifier: "/d/c",
            children: [ ],
        },
        {
            identifier: "/d/d",
            children: [ ],
        },
];

const bfs = new BFSearch(websiteLinks);
bfs.search("/", 1);

console.log(bfs.storage);
console.log(bfs.queue);

// Map {
//     '/' => { visited: true, depth: 0, weight: 5, isMissing: false },
//     '/a' => { visited: true, depth: 1, weight: 4, isMissing: false },
//     '/b' => { visited: true, depth: 1, weight: 4, isMissing: false },
//     '/c' => { visited: true, depth: 1, weight: 4, isMissing: false },
//     '/d' => { visited: true, depth: 1, weight: 4, isMissing: false },
//     '/b/a' => { visited: false, depth: 2, weight: 0, isMissing: false },
//     '/d/a' => { visited: false, depth: 2, weight: 0, isMissing: false },
//     '/d/b' => { visited: false, depth: 2, weight: 0, isMissing: false },
//     '/d/c' => { visited: false, depth: 2, weight: 0, isMissing: false },
//     '/d/d' => { visited: false, depth: 2, weight: 0, isMissing: false } }
// Set { '/b/a', '/d/a', '/d/b', '/d/c', '/d/d' }
