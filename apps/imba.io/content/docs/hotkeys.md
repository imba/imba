# Hotkeys

To make it easier to add consistent shortcuts throughout your apps, Imba includes a custom [@hotkey](api) event. Behind the scenes it uses the [mousetrap.js](https://craig.is/killing/mice) library.

### Syntax

```imba
# supply the key combo in the @hotkey(arguments)
<div @hotkey('ctrl+shift+k')=handler>

# gmail style sequences
<div @hotkey('g i')=handler>

# hotkey without a handler defaults to click
<div @hotkey('mod+n') @click=clickHandler>

# hotkey without a handler on a form field will focus
<input @hotkey('s') placeholder="Search...">

# multiple hotkeys
<input @hotkey('mod+k|s')>

# capture all hotkeys
<div @hotkey('*').global>
```

### Usage

For multiple elements with the same hotkey - the ones later in the dom will be called first - and always stop there unless the handlers have set the `.passive` modifier.

```imba
<div @hotkey('f').passive.log('not called')>
<div @hotkey('f').log('called next - stops here')>
<div @hotkey('f').passive.log('called first')>
```

Hotkeys are only active when / if they are present in the dom. This makes it very easy to conditionally enable certain hotkeys in a declarative manner.

```imba
tag App
    <self>
        if let item = state.selection
            <div[d:none]
                @hotkey('del')=deleteItem(item)
                @hotkey('enter')=editItem(item)
                @hotkey('esc')=(state.selection = null)
            >
```
In the example above we add a hidden div to the dom if there is a selItem, and add three hotkey handlers to this element. So, whenever `state.selection` is set, pressing `enter` will trigger the `editItem(item)` handler.

For hotkey groups and disabling/enable all hotkeys within a certain dom tree see the [Element.hotkeys](/api/Element/hotkeys) property.

### Hotkey Interface

<api-list>imba.HotkeyEvent.own</api-list>
