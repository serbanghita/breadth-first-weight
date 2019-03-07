import HTTPLinkSearch from "./HTTPLinkSearch";

const ls = new HTTPLinkSearch();
ls.search("http://google.com/", 2).then(() => {
    console.log(ls.storage);
    console.log(ls.queue);
});

