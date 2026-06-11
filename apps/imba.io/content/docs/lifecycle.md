# Component Lifecycle

## Lifecycle Hooks

These methods are meant to be defined in your components. In most cases you will only define a `render` method, and possibly `awaken` if you want to do some additional initialization when the element is first attached to the document.

<api-list>imba.Component.own.methods.#lifecycle</api-list>

## Lifecycle States

Components also has a bunch of getters that you can call to inspect where in the lifecycle a component is

<api-list>imba.Component.own.getters</api-list>