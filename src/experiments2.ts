// const tree: {[node: string]: { status: number, children: string[]}} = {
//     "/": { status: 200, children: ["/a", "/b"] },
//     "/a": { status: 200, children: ["/a/a", "/a/b"] },
//     "/b": { status: 200, children: ["/b/a", "/b/b"] },
//     "/a/a": { status: 200, children: ["/a/a/a"] },
//     "/a/b": { status: 200, children: [] },
//     "/b/a": { status: 200, children: [] },
//     "/b/b": { status: 404, children: ["/b/b/a"] },
//     "/a/a/a": { status: 200, children: ["/a/a/a/a"] },
//     "/b/b/a": { status: 200, children: [] },
//     "/a/a/a/a": { status: 200, children: [] },
// };
//
// let j = 0;
//
// function myPromise(node: string): Promise<{ node: string, status: number, children: string[], j: number}> {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             const r = tree[node];
//             if (r) {
//                 resolve({
//                     node,
//                     status: r.status,
//                     children: r.children,
//                     j: ++j,
//                 });
//             } else {
//                 reject(`${node} not found`);
//             }
//         }, Math.floor(Math.random() * Math.floor(1000)));
//     });
// }
//
// function sequentialFnPromises(tasks: Array<() => Promise<any>>) {
//     return tasks.reduce((promiseChain: Promise<any[]>, currentTask: () => Promise<any>) => {
//         return promiseChain.then((chainResults) =>
//             currentTask().then((currentResult) => [ ...chainResults, currentResult ]),
//         );
//     }, Promise.resolve([]));
// }
//
// export function chunkArray(array: any[], size: number): any[] {
//     if (!array) {
//         return [];
//     }
//     const firstChunk = array.slice(0, size);
//     if (!firstChunk.length) {
//         return array;
//     }
//     return [firstChunk].concat(chunkArray(array.slice(size, array.length), size));
// }
//
// const queue: Set<string> = new Set([]);
// const storage: Map<string, { status: number, visited: boolean, isMissing: boolean, weight: number, depth: number }> = new Map([]);
// let fnArray: Array<() => Promise<{ status: number, children: string[], j: number}>> = [];
// let depth = 0;
//
// function search(maxDepth: number): Promise<any> {
//
//     if (depth > maxDepth) {
//         return Promise.reject(`Maximum depth of ${maxDepth} reached.`);
//     }
//
//     fnArray = [...queue].map((nodeInQueue) => {
//         queue.delete(nodeInQueue);
//         return () => myPromise(nodeInQueue);
//     });
//
//     const fnArrayBatches = chunkArray(fnArray, 2);
//
//     const fnSequenceBatches = fnArrayBatches.map((fnArrayBatch) => {
//         return () => sequentialFnPromises(fnArrayBatch).then((result) => {
//             result.forEach((nodeResult) => {
//                 const nodeResultRecord = storage.get(nodeResult.node);
//
//                 if (nodeResultRecord) {
//                     nodeResultRecord.status = nodeResult.status;
//                     nodeResultRecord.visited = true;
//                     storage.set(nodeResult.node, nodeResultRecord);
//                 } else {
//                     storage.set(nodeResult.node, {
//                         status: nodeResult.status,
//                         visited: true,
//                         isMissing: false,
//                         weight: 0,
//                         depth,
//                     });
//                 }
//
//                 nodeResult.children.forEach((nodeChild: string) => {
//                     const nodeChildRecord = storage.get(nodeChild);
//                     if (nodeChildRecord) {
//                         nodeChildRecord.weight += 1;
//                         storage.set(nodeChild, nodeChildRecord);
//                     } else {
//                         storage.set(nodeChild, {
//                             status: 0,
//                             visited: false,
//                             isMissing: false,
//                             weight: 0,
//                             depth: depth + 1,
//                         });
//                         queue.add(nodeChild);
//                     }
//                 });
//             });
//         });
//     });
//
//     return sequentialFnPromises(fnSequenceBatches).then(() => {
//         depth += 1;
//
//         if (queue.size > 0) {
//             return search(maxDepth).catch((err) => {
//                 console.log(err);
//             });
//         }
//     });
//
// }
//
// queue.add("/");
// // queue.add("/a");
// // queue.add("/b");
// search(2).then(() => {
//     console.log(storage);
//     console.log(queue);
//     console.log("\n\n");
// }).catch((err) => {
//     console.log(err);
// });