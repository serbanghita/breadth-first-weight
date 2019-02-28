export interface IWebsitePage {
    href: string;
    links: string[];
}

const pages: IWebsitePage[] = [
    {
        href: "/",
        links: [ "/", "/manual", "/faq", "/blog" ],
    },
    {
        href: "/manual",
        links: [ "/", "/faq", "/manual", "/blog", "/manual/page" ],
    },
    {
        href: "/manual/page",
        links: [ "/", "/faq", "/manual", "/blog" ],
    },
    {
        href: "/faq",
        links: [ "/", "/faq", "/manual", "/blog" ],
    },
    {
        href: "/blog",
        links: [ "/", "/faq", "/manual", "/blog", "/blog/post-first", "/blog/post-second", "/blog/post-third", "/blog/post-forth" ],
    },
    {
        href: "/blog/post-first",
        links: [ "/", "/faq", "/manual", "/blog" ],
    },
    {
        href: "/blog/post-second",
        links: [ ],
    },
    {
        href: "/blog/post-third",
        links: [ ],
    },
    {
        href: "/blog/post-forth",
        links: [ ],
    },
];

export function getPage(href: string): IWebsitePage | undefined {
    return pages.find((a: IWebsitePage) => a.href === href);
}
