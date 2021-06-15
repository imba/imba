Adding global/window event listeners are still pretty verbose in Imba. You need to fall back to window.addEventListener. This has many downsides:

- Verbose and inelegant
- Not possible to use event modifiers
- Need to remove the listeners yourself

## Proposal

Allow a `<global>` tag inside your tag trees that is a reference to the document / root, on which you can define events with modifiers. Imba keeps track of it all, and automatically adds/removes the listeners when it mounts/unmounts. We could even support flags here, that could also be automatically set/unset on the root html element based on mount/unmount.

This could even be used to inject elements in the root like menus etc when a component renders. It may complicate things though, so we'll see.

The tag should support both document events and window events like @scroll, @resize, @onbeforeunload and more.

## Considerations

- Do we want to wrap the global inside self, or at the top-level tag?
- To do this we will need a way to listen to the mount/unmount of parent tags
- May need to actually implement it as a special web component.
