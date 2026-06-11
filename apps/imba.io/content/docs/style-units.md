# Custom Units

In addition to regular css units like `px`,`em` and `vw`, Imba allows you to declare your own units and override these units inside selectors like any other property.

You might have heard about `rem` (root em) units in css. The benefit of using rems is that you can change the size of the unit by changing the font size on the html element. Custom units in Imba is like being able to create arbitrary rem-like units that can also be changed and overridden within tag trees and selectors. It is incredibly powerful!

The basic syntax for declaring a style unit is:

```imba
global css @root
    1fh: 24px # declaring a unit named fh (field height)
    1ffs: 14px # declaring a unit named ffs (field font size)
```
Now that this unit is declared, you can use this anywhere in your css:

```imba
css .field
    height:1fh
    font-size:1ffs
```

These units become very powerful when you change their values inside selectors and when matching screen sizes and other media queries.

```imba
global css @root
    1space:14px .dense:8px
    @lg 1space:18px .dense: 12px
```

Now we have a `space` unit where `1space` defaults to `14px`. Inside any element with a `.dense` class, the 1space unit will instead default to `8px`. If the viewport is above 1024px wide (`@lg` modifier), the values for `space` will change.

Units can be declared at any level in your html tree, not just at `@root`.

```imba
tag Dashboard
    css self
        # sidebar width
        1sbw:200px @lg:260px

    <self>
        <aside[w:1sbw]> 
        <main[ml:0.5sbw pl:0.5sbw]>
```

Internally, custom units are just implemented as css variables.
```imba
global css @root
    1space:12px 
    hr my:0.5space
```
Compiles to the following css
```css
:root {
    --u_space:12px
}
:root hr {
    margin-top:calc(var(--u_space) * 0.5)
}
```