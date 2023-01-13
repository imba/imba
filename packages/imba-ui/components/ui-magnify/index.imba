tag ui-magnify

	scale = 1

	get zoomed_in?
		$container.style.transform isnt ''

	def zoom_out
		$container.style.transform = ''

	def zoom_in
		let { x, y, width, height } = $container.getBoundingClientRect!
		let scale_by_height = (global.window.innerWidth/global.window.innerHeight) > (width/height)
		let ds = scale_by_height ? scale*global.window.innerHeight/height : scale*global.window.innerWidth/width
		let dx = global.window.innerWidth/2 - width/2 - x
		let dy = global.window.innerHeight/2 - height/2 - y
		$container.style.transform = "translate({dx}px, {dy}px) scale({ds})"

	def handle_click
		zoomed_in? ? zoom_out! : zoom_in!

	<self @click=handle_click @hotkey('esc').passive=zoom_out>

		<global @resize=zoom_out @scroll=zoom_out>

		<%bg>
			css e:500ms
			if zoomed_in?
				css bg:black/30 pos:fixed inset:0

		<$container>
			css d:inline-block e:500ms cubic-bezier(.19,1,.22,1)

			<slot>
