// http://www.browsersync.io/docs/options/
module.exports = {
    open: "local",
    localOnly: true,
    reloadDebounce: 2000,
    ui: false,
    files: [
        "public",
        // "./node_modules/[...]/build/css/*.css",
        // "./node_modules/[...]/build/js/*.js",
    ],
    // serveStatic: [{
    //     route: "/fake",
    //     dir: "./node_modules/[...]/build/"
    // }],
    watchEvents: [
        "change"
    ],
    watch: true,
    server: {
        baseDir: "public",
        index: "index.html"
    },
    port: 3333,
    logLevel: "silent"
};