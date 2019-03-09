import HTTPLinkSearch from "./HTTPLinkSearch";

// const ls = new HTTPLinkSearch();
// ls.search("http://google.com/", 2).then(() => {
//     console.log(ls.storage);
//     console.log(ls.queue);
// });

const tree: {[node: string]: { status: number, children: string[]}} = {
    "/": { status: 200, children: ["/a", "/b"] },
    "/a": { status: 200, children: ["/a/a", "/a/b"] },
    "/b": { status: 200, children: ["/b/a", "/b/b"] },
    "/a/a": { status: 200, children: ["/a/a/a"] },
    "/a/b": { status: 200, children: [] },
    "/b/a": { status: 200, children: [] },
    "/b/b": { status: 404, children: ["/b/b/a"] },
    "/a/a/a": { status: 200, children: ["/a/a/a/a"] },
    "/b/b/a": { status: 200, children: [] },
    "/a/a/a/a": { status: 200, children: [] },
};

let j = 0;

function myPromise(node: string): Promise<{ node: string, status: number, children: string[], j: number}> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const r = tree[node];
            if (r) {
                resolve({
                    node,
                    status: r.status,
                    children: r.children,
                    j: ++j,
                });
            } else {
                reject(`${node} not found`);
            }
        }, Math.floor(Math.random() * Math.floor(1000)));
    });
}

function sequentialPromises(tasks: Array<() => Promise<any>>) {
    return tasks.reduce((promiseChain: Promise<any[]>, currentTask: () => Promise<any>) => {
        return promiseChain.then((chainResults) =>
            currentTask().then((currentResult) => [ ...chainResults, currentResult ]),
        );
    }, Promise.resolve([]));
}

const queue: Set<string> = new Set([]);
const storage: Map<string, { status: number, visited: boolean, isMissing: boolean, weight: number }> = new Map([]);
let indexer: Array<() => Promise<{ status: number, children: string[], j: number}>> = [];

function search() {
    queue.forEach((nodeInQueue) => {
        indexer.push(() => myPromise(nodeInQueue));
        queue.delete(nodeInQueue);
    });

    sequentialPromises(indexer).then((result) => {
        result.forEach((nodeResult) => {
            const nodeResultRecord = storage.get(nodeResult.node);

            if (nodeResultRecord) {
                nodeResultRecord.status = nodeResult.status;
                nodeResultRecord.visited = true;
                storage.set(nodeResult.node, nodeResultRecord);
            } else {
                storage.set(nodeResult.node, {
                    status: nodeResult.status,
                    visited: true,
                    isMissing: false,
                    weight: 0,
                });
            }

            nodeResult.children.forEach((nodeChild: string) => {
                const nodeChildRecord = storage.get(nodeChild);
                if (nodeChildRecord) {
                    nodeChildRecord.weight += 1;
                    storage.set(nodeChild, nodeChildRecord);
                } else {
                    storage.set(nodeChild, {
                        status: 0,
                        visited: false,
                        isMissing: false,
                        weight: 0,
                    });
                    queue.add(nodeChild);
                }
            });
        });

        indexer = [];

        if (queue.size > 0) {
            search();
        }

    }).then(() => {
        console.log(storage);
        console.log(queue);
    });
}


queue.add("/");
// queue.add("/a");
// queue.add("/b");
search();
