A media or container modifier in front of a selector list applies to every selector in the list. In

```imba
tag app-table
	css @!700 th, td p:1
```

the rule compiled to a nested rule that matched only a `td` inside a `th`, so it did nothing. Both cells now get the padding below 700px, as they do with `css th, td` and a nested `@!700 p:1`. The same applies to a nested list, such as `@!700 .q, .r` inside `css .p`. A state modifier, such as `@hover`, in front of a list still applies to the first selector only.

A modifier after one selector in a list applies to that selector only. `css .a@md, .b` used to compile to a nested rule that matched only a `.b` inside an `.a`. Now `.a` gets the style at `@md` and `.b` gets it at every width.
