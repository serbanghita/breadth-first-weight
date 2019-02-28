const myTasks = [
    Promise.resolve("boss1"),
    Promise.resolve("boss2"),
    Promise.resolve("boss3"),
    Promise.resolve("boss4"),
    Promise.resolve("boss5"),
    Promise.resolve("boss6"),
    Promise.resolve("boss7"),
    Promise.resolve("boss8"),
    Promise.resolve("boss9"),
    Promise.resolve("boss10"),
];

// Sequential.
function sequential(tasks: Array<Promise<any>>) {
    return tasks.reduce((promiseChain: Promise<any[]>, currentTask: Promise<any>) => {
        return promiseChain.then((chainResults) =>
            currentTask.then((currentResult) => [ ...chainResults, currentResult ]),
        );
    }, Promise.resolve([]));
}

// sequential(myTasks).then((results) => console.log(results));
// [ 'boss1',
//     'boss2',
//     'boss3',
//     'boss4',
//     'boss5',
//     'boss6',
//     'boss7',
//     'boss8',
//     'boss9',
//     'boss10' ]


// Sequential batch.
function chunk(array: any[], size: number): any[] {
    if (!array) {
        return [];
    }
    const firstChunk = array.slice(0, size); // create the first chunk of the given array
    if (!firstChunk.length) {
        return array; // this is the base case to terminal the recursive
    }
    return [firstChunk].concat(chunk(array.slice(size, array.length), size));
}

const myTasksBatch = chunk(myTasks, 3);
// [ [ Promise { 'boss1' }, Promise { 'boss2' }, Promise { 'boss3' } ],
//     [ Promise { 'boss4' }, Promise { 'boss5' }, Promise { 'boss6' } ],
//     [ Promise { 'boss7' }, Promise { 'boss8' }, Promise { 'boss9' } ],
//     [ Promise { 'boss10' } ] ]
const a: Array<Promise<string[]>> = myTasksBatch.map((batch: Array<Promise<string>>) => {
    return sequential(batch);
});
// console.log(a);

// [ Promise { <pending> },
// Promise { <pending> },
// Promise { <pending> },
// Promise { <pending> } ]

sequential(a).then((results) => console.log(results));
// [ [ 'boss1', 'boss2', 'boss3' ],
//     [ 'boss4', 'boss5', 'boss6' ],
//     [ 'boss7', 'boss8', 'boss9' ],
//     [ 'boss10' ] ]
