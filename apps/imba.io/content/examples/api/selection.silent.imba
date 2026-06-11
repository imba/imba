# [preview=md]
import 'util/styles'

# ---
tag Filter
	counter = 0
	<self>
		<div> "Filter rendered {counter++} times"
		<input value="Default" @selection.log('!')>
		<input value="Silent" @selection.silent.log('!')>

tag App
	counter = 0
	<self[ta:center]>
		<b> "App rendered {counter++} times"
		<Filter>

imba.mount <App>
###
If you try to select the "Default" text you will see that both the `App` and the `Filter` elements re-render. This happens because `App` is mounted via `imba.mount` which automatically schedules the element to render after events, and the Filter is rendered when `App` is rendered since it is a descendant of `App`. Now if you select text in the "Silent" input, it too has an event handler for the same event, but we've added a `.silence` modifier. This prevents the handler from automatically re-rendering scheduled elements after the event.
###