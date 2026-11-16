Register the css variables behind transforms, easing and runtime values with `@property`, so that they do not inherit. `x`, `y`, `z`, `rotate`, `scale` and `skew` are compiled to `--t_*` variables, `ea`, `eo`, `ec` and the other ease properties to `--e_*` variables, and a runtime value such as `<div[x:{dx}px w:{width}px]>` is set as a variable on the element. CSS variables inherit by default, so every change made the browser recalculate the style of each element inside. Moving a panel with 5000 elements in it took about 1.4ms of style recalculation per update in Chrome. An update now only restyles the element itself.

The defaults of the transform and ease variables are now the initial values of the registered properties. The shared rules no longer reset every variable on every element that uses them, and an ease group that is not set falls back to the group it extends in the transition itself. A runtime value keeps inheriting when it is read by a pseudo-element, such as `c@before:{color}`, or by a rule for a descendant in a `css` block of the tag tree.

This changes three things:

- Transform and ease properties need a browser with `@property`: Chrome 85, Safari 16.4 or Firefox 128. In an older browser they have no effect.
- The `--t_*` and `--e_*` declarations are no longer `!important`. They follow the normal cascade like every other property, so an inline `style` attribute or a rule with `@important` now wins over them.
- The variable of an ease group that is not set is empty. `--e_od` used to resolve to the duration it fell back to. Read the computed `transition` of the element instead.

Every compiled stylesheet registers the properties it uses. When `imba build` merges stylesheets into one css file it removes the `@property` rules that are repeated, so each property is registered once per file.
