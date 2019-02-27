export interface IWebsitePage {
    title: string;
    href: string;
    links: string[];
}

const pages: IWebsitePage[] = [
    {
        title: "Home",
        href: "/",
        links: [ "/", "/manual", "/faq", "/blog" ],
    },
    {
        title: "Manual",
        href: "/manual",
        links: [ "/", "/faq", "/manual", "/blog", "/manual/page" ],
    },
    {
        title: "FAQ",
        href: "/faq",
        links: [ "/", "/faq", "/manual", "/blog" ],
    },
    {
        title: "Blog",
        href: "/blog",
        links: [ "/", "/faq", "/manual", "/blog", "/blog/post-first", "/blog/post-second", "/blog/post-third", "/blog/post-forth" ],
    },
    {
        title: "Blog Post - First",
        href: "/blog/post-first",
        links: [ "/", "/faq", "/manual", "/blog", "/random-page-first" ],
    },
    {
        title: "Blog Post - Second",
        href: "/blog/post-second",
        links: [ ],
    },
    {
        title: "Blog Post - Third",
        href: "/blog/post-third",
        links: [ ],
    },
    {
        title: "Blog Post - Forth",
        href: "/blog/post-forth",
        links: [ ],
    },
];

export function getPage(href: string): IWebsitePage | undefined {
    return pages.find((a: IWebsitePage) => a.href === href);
}
