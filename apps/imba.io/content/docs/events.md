# Events

Imba has a special syntax for defining complex event handlers with very little code. You can listen to any DOM event by simply declaring `<div @eventname=handler>` on your elements.

```imba
<div @click.stop.cooldown=console.log('hey')> 'Click me'
```

In addition to supporting all the native DOM events, and arbitrary custom events, Imba includes several convenient custom events to simplify important aspects of developing web applications:

<api-list>ImbaEvents.own.events.custom</api-list>

### Further reading

<doc-pages></doc-pages>
