// function a() {
//     return new Promise((resolve, reject) => {
//         reject(new Error(`Some error in a.`));
//     });
// }
//
// async function b() {
//     await a().catch(async (err) => {
//         await log(err).then((msg) => console.log(msg)); // Remove (async/await).
//         throw Error(`Some new error from b via a.`);
//     });
// }
//
// async function log(err: Error) {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => resolve(err.message), 1000);
//     });
// }
//
// b().catch((err) => {
//     console.log(err.message);
// });

// function a(): Promise<string> {
//     return new Promise((resolve, reject) => {
//         // reject(new Error(`Some error in a.`));
//         resolve("aaa");
//     });
// }
//
//
// async function c() {
//     return new Promise((resolve, reject) => {
//         reject(new Error(`Some error in b`));
//     });
// }
//
//
// async function b() {
//     let x;
//
//     try {
//         x = await a().catch((err) => {
//             throw Error(`Some new error from b via a.`);
//         });
//         await c();
//
//     } catch (err) {
//         console.log(x);
//     }
// }
//
// b();

// strict: true in tsconfig


function log(...msgs: string[]) {
    console.log(msgs);
}

log("a", "b", "c");
