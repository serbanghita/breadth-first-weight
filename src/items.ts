import {IListItem} from "./BFSearch";

const items: IListItem[] = [
    {
        identifier: "/",
        children: [ "/", "/a", "/b", "/c", "/d" ],
    },
    {
        identifier: "/a",
        children: [ "/", "/a", "/b", "/c", "/d" ],
    },
    {
        identifier: "/b",
        children: [ "/", "/a", "/b", "/b/a", "/c", "/d" ],
    },
        {
            identifier: "/b/a",
            children: [ "/", "/a", "/b", "/c", "/d" ],
        },
            {
                identifier: "/b/a/a",
                children: [ "/b/a/a/a" ],
            },
                {
                    identifier: "/b/a/a/a",
                    children: [],
                },
    {
        identifier: "/c",
        children: [ "/", "/a", "/b", "/c", "/d" ],
    },
    {
        identifier: "/d",
        children: [ "/", "/a", "/b", "/c", "/d", "/d/a", "/d/b", "/d/c", "/d/d" ],
    },
        {
            identifier: "/d/a",
            children: [ "/", "/a", "/b", "/c", "/d", "/d/a/a" ],
        },
            {
                identifier: "/d/a/a",
                children: [ ],
            },
        {
            identifier: "/d/b",
            children: [ "/d/b/a" ],
        },
            {
                identifier: "/d/b/a",
                children: [ "/d/b/a/a", "/d/b/a/b" ],
            },
                {
                    identifier: "/d/b/a/a",
                    children: [ ],
                },
                {
                    identifier: "/d/b/a/b",
                    children: [ ],
                },
        {
            identifier: "/d/c",
            children: [ ],
        },
        {
            identifier: "/d/d",
            children: [ ],
        },
];

export default items;
