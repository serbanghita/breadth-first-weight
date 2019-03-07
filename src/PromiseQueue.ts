
function myPromise(r: string) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(r);
        }, Math.floor(Math.random() * Math.floor(1000)));
    });
}

const myTasks = [
    myPromise("boss1"),
    myPromise("boss2"),
    myPromise("boss3"),
    myPromise("boss4"),
    myPromise("boss5"),
    myPromise("boss6"),
    myPromise("boss7"),
    myPromise("boss8"),
    myPromise("boss9"),
    myPromise("boss10"),
];

// Sequential.
export function sequentialPromises(tasks: Array<Promise<any>>): Promise<any[]> {
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
export function chunkArray(array: any[], size: number): any[] {
    if (!array) {
        return [];
    }
    const firstChunk = array.slice(0, size); // create the first chunk of the given array
    if (!firstChunk.length) {
        return array; // this is the base case to terminal the recursive
    }
    return [firstChunk].concat(chunkArray(array.slice(size, array.length), size));
}

const myTasksBatch = chunkArray(myTasks, 3);
// [ [ Promise { 'boss1' }, Promise { 'boss2' }, Promise { 'boss3' } ],
//     [ Promise { 'boss4' }, Promise { 'boss5' }, Promise { 'boss6' } ],
//     [ Promise { 'boss7' }, Promise { 'boss8' }, Promise { 'boss9' } ],
//     [ Promise { 'boss10' } ] ]
const a: Array<Promise<string[]>> = myTasksBatch.map((batch: Array<Promise<string>>) => {
    return sequentialPromises(batch);
});
// console.log(a);

// [ Promise { <pending> },
// Promise { <pending> },
// Promise { <pending> },
// Promise { <pending> } ]

// sequentialPromises(a).then((results) => console.log(results));
// [ [ 'boss1', 'boss2', 'boss3' ],
//     [ 'boss4', 'boss5', 'boss6' ],
//     [ 'boss7', 'boss8', 'boss9' ],
//     [ 'boss10' ] ]
