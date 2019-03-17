// (async function() {
//
//     function getPage() {
//         return new Promise((resolve, reject) => {
//             reject(new Error("Page didn't load"));
//         });
//     }
//
//     try {
//         await getPage()
//         .catch((err) => {
//             console.log("Promise.catch", err.message);
//             throw err;
//         });
//
//     } catch (err) {
//         console.log("catch!", err.message);
//     }
// })();
//
// (function() {
//
//     function getPage(): Promise<{a: 1, b: 2}> {
//         return new Promise((resolve, reject) => {
//             reject(new Error("Page didn't load"));
//         });
//     }
//
//     try {
//
//         const page = getPage()
//         .then((r) => {
//             console.log(r.a, r.b);
//         })
//         .catch((err) => {
//             console.log("Promise.catch", err.message);
//             throw err;
//         });
//
//     } catch (err) {
//         console.log("catch!!!!", err.message);
//     }
//
// })();

// try {
//     (() => {
//         throw new Error(`What?`);
//     })();
//
// } catch (err) {
//     console.log("catch!", err.message);
// }

class RequestError extends Error {
    constructor(public code: string, ...params: any[]) {
        super(...params);

        this.code = code;
    }
}

// (async function() {
//
//     function getPage() {
//         return new Promise((resolve, reject) => {
//             reject(new Error("Page didn't load"));
//         });
//     }
//
//     try {
//         await getPage()
//         .catch((err) => {
//             throw new RequestError("GET_PAGE", err);
//         });
//
//     } catch (err) {
//         console.log("catch!", err.code, err.name, err.message);
//         console.log(err.stack);
//     }
// })();

(async () => {

    function getLinks(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            // resolve(["a", "b", "c", "d", "e"]);
            reject(new Error(`cannot get links`));
        });
    }

    const links = await getLinks()
        .then((r) => {
            return r.filter((a) => a === "a");
        })
        .catch((err) => {
        console.log(err.message);
        return [];
    });

    console.log(links);

})();
