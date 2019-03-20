function* linkGenerator(requestIndex: number) {
    const links = ["/a", "/b", "/c", "/d"];
    while (requestIndex < 2) {
        yield links[requestIndex++];
    }
}

const lg = linkGenerator(0);

console.log(lg.next());
console.log(lg.next());
console.log(lg.next());

// { value: '/a', done: false }
// { value: '/b', done: false }
// { value: undefined, done: true }
