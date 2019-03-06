// Bootstrap
import BFSearch from "./BFSearch";
import items from "./items";

const bfs = new BFSearch(items);
bfs.search("/", 1);

console.log(bfs.storage);
console.log(bfs.queue); //

// Map {
//     '/' => { visited: true, depth: 0, weight: 1 },
//     '/a' => { visited: true, depth: 1, weight: 0 },
//     '/b' => { visited: true, depth: 1, weight: 0 },
//     '/c' => { visited: true, depth: 1, weight: 0 },
//     '/d' => { visited: true, depth: 1, weight: 0 },
//     '/b/a' => { visited: true, depth: 2, weight: 0 },
//     '/d/a' => { visited: true, depth: 2, weight: 0 },
//     '/d/b' => { visited: true, depth: 2, weight: 0 },
//     '/d/c' => { visited: true, depth: 2, weight: 0 },
//     '/d/d' => { visited: true, depth: 2, weight: 0 } }
// Set { '/d/a/a', '/d/b/a' }
