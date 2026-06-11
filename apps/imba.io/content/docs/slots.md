# Component Slots

## Using Slots

Sometimes you want to allow taking in elements from the outside and render them somewhere inside the tree of your component. `<slot>` is a placeholder for the content being passed in from the outside.

### Default Slot

```imba
tag app-option
    <self>
        <input type="checkbox">
        <label> <slot>

imba.mount do <app-option>
    <b> "Option name"
    <span> "Description for this option"
```

### Placeholder Content [preview=md]

Anything inside the `<slot>` will be shown if no content is supplied from outside.

```imba
import 'util/styles'
css body d:flex
css app-option d:hflex a:center
css app-example d:vflex

# ---
tag app-option
    <self>
        <input type="checkbox">
        <label> <slot> "Default label"

tag app-example
    <self>
        <app-option>
        <app-option> <span> "Custom label"

imba.mount <app-example>
```

### Named Slots [preview=md]

You can also add named slots using `<slot name=...>` and render into them using `<el slot=slotname>` in the outer rendering.

```imba
# ~preview
import 'util/styles'
css body d:flex

css app-panel d:hflex
    aside p:1 bg:gray3
    main p:1 fs:md fl:1

# ---
tag app-panel
    <self.panel>
        <aside.left> <slot name="sidebar"> "Sidebar"
        <main> <slot> <p> "Default Body"
        <aside.right> <slot name="Detail"> "Right"

imba.mount do <app-panel>
    <div slot="sidebar"> "Stuff!"
    <div> "Something in main slot"
    <div> "More in main slot"

```
