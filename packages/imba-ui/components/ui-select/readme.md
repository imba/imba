## Select

`ui-select` is implemented as an event modifier.

- One reason for this is not having to mount the select menu manually.

- Another is not having to pass the event target as the anchor for floating ui manually.

You can also still mount it manually if you want.

`ui-select` takes a list of items and an options object.
You can supply a getter named `cb` to the options object.
If no getter function is supplied, `ui-select` will assume it was passed a list of strings.
Otherwise, it will call the getter to get the string to display each item.

```imba
tag app

	items = ["hello", "world", "hi"]
	item = items[0]

	<self>
		css inset:0 d:hts

		<button bind=item @click.select(items)> item

imba.mount <app>
```

Available `opts`:

- `pos`: corresponds to https://floating-ui.com/docs/tutorial#placements
- `offset`: corresponds to https://floating-ui.com/docs/offset#__next
- `searchable`: a boolean describing whether the menu is searchable or not. Defaults to yes.
