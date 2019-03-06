Generated with https://mermaidjs.github.io/mermaid-live-editor


```
graph TD
slash[/]-->slash1[/]
slash[/]-->a[/a]
slash[/]-->b[/b]
slash[/]-->c[/c]

a[/a]-->slash2[/]
a[/a]-->a1[/a]
a[/a]-->aa[/a/a]
a[/a]-->ab[/a/b]

b[/b]-->slash3[/]
b[/b]-->b1[/b]
b[/b]-->ba[/b/a]
b[/b]-->bb[/b/b]

c[/c]-->slash4[/]
c[/c]-->c1[/c]
c[/c]-->ca[/c/a]
c[/c]-->cb[/c/b/]

aa[/a/a]-->slash5[/]
aa[/a/a]-->aa1[/a/a]
aa[/a/a]-->aaa[/a/a/a]
aa[/a/a]-->more[...]

classDef green fill:#eee,stroke:#ccc,stroke-width:2px;
class slash1,slash2,slash3,slash4,slash5,a1,b1,c1,aa1 green
```