# Event Modifiers

### Shared Modifiers

<api-list>Event.own.modifiers</api-list>

### Keyboard Modifiers

<api-list>KeyboardEvent.own.modifiers</api-list>

### Mouse Modifiers

<api-list>MouseEvent.own.modifiers</api-list>

### Pointer Modifiers

<api-list>PointerEvent.own.modifiers</api-list>

### Touch Modifiers

<api-list>imba.Touch.own.methods</api-list>

### Custom Modifiers

You can create your own event modifiers by extending the event classes. Any method named with an `@` prefix becomes available as a modifier on that kind of event:

```imba
# [preview=lg]
# ---
extend class Event
    def @confirm msg = 'Are you sure?'
        return global.window.confirm(msg)

tag app-root
    count = 0
    <self[d:block p:3]>
        <button[p:1 px:2 rd:md bg:red2 @hover:red3] @click.confirm('Delete this item?')=count++> "Delete"
        <div[mt:2 c:gray6]> "Deleted {count} items"
# ---
imba.mount do <app-root>
```

Inside the modifier, `self` is the event itself — so you have direct access to `target`, `preventDefault`, and everything else on the event. Arguments you pass at the call site (`@click.confirm('Delete this item?')`) arrive as regular parameters.

Modifiers run in order as steps in the handler chain, and the return value decides what happens next:

- Return `false` to stop the chain — the remaining modifiers and the handler will not run.
- Return a promise and the chain pauses until it resolves, just like the built-in `@wait` and `@debounce` modifiers. If it resolves to `false`, the chain stops.
- Any other value lets the chain continue.

This makes async guards trivial:

```imba
extend class Event
    # pause the chain while saving - stop unless it succeeded
    def @save
        let res = await global.fetch('/save', method: 'POST')
        return res.ok

tag app-form
    <self>
        <button @click.save.flag('saved')> "Save"
```

Custom modifiers can be negated with `!` just like the built-in ones — `@click.!confirm('...')` continues only when the modifier returns a falsy value.

#### Scoping modifiers to an event type

Extend a specific event interface to make a modifier available only for those events:

```imba
extend class KeyboardEvent
    # only continue if the pressed key is a digit
    def @digit
        return /^[0-9]$/.test(key)

tag app-fields
    <self>
        <input @keydown.digit.log('typed a digit')>
```
