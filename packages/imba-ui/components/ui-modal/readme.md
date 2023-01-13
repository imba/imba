# ui-modal

Simply inherit a tag from `ui-modal`, define a `body` function, and mount the inheritor manually.

```imba
tag LoginModal < ui-modal
	def body
		<div>
			<h2> "This is a modal"
			<ui-button@click=cancel> "Cancel"

tag app
	<self>
		<ui-button@click=(imba.mount new <LoginModal>)> "Log In"
```

- `ui-modal` itself is the fullscreen background.
- The div you return in `body` is the modal.
- Default hotkeys are bound to handlers:
	- `esc`: cancel

Example:

```imba
tag LoginModal < ui-modal

	def submit
		console.log "Logging in..."

	def body
		<div>
			<h2> "This is a modal"
			<ui-button@click=submit> "Log In"
			<ui-button@click=cancel> "Cancel"

tag app
	<self>
		<ui-button@click=(imba.mount new <LoginModal>)> "Log In"
```

In this example, `cancel` also gets called when the user presses `esc`.
