export interface IWebsitePage {
    href: string;
    links: string[];
}

const pages: IWebsitePage[] = [
    {
        href: "/",
        links: [ "/", "/a", "/b", "/c", "/d" ],
    },
    {
        href: "/a",
        links: [ "/", "/a", "/b", "/c", "/d" ],
    },
    {
        href: "/b",
        links: [ "/", "/a", "/b", "/b/a", "/c", "/d" ],
    },
        {
            href: "/b/a",
            links: [ "/", "/a", "/b", "/c", "/d" ],
        },
            {
                href: "/b/a/a",
                links: [ "/b/a/a/a" ],
            },
                {
                    href: "/b/a/a/a",
                    links: [],
                },
    {
        href: "/c",
        links: [ "/", "/a", "/b", "/c", "/d" ],
    },
    {
        href: "/d",
        links: [ "/", "/a", "/b", "/c", "/d", "/d/a", "/d/b", "/d/c", "/d/d" ],
    },
        {
            href: "/d/a",
            links: [ "/", "/a", "/b", "/c", "/d", "/d/a/a" ],
        },
            {
                href: "/d/a/a",
                links: [ ],
            },
        {
            href: "/d/b",
            links: [ "/d/b/a" ],
        },
            {
                href: "/d/b/a",
                links: [ "/d/b/a/a", "/d/b/a/b" ],
            },
                {
                    href: "/d/b/a/a",
                    links: [ ],
                },
                {
                    href: "/d/b/a/b",
                    links: [ ],
                },
        {
            href: "/d/c",
            links: [ ],
        },
        {
            href: "/d/d",
            links: [ ],
        },
];

export function getPage(href: string): IWebsitePage | undefined {
    return pages.find((a: IWebsitePage) => a.href === href);
}
