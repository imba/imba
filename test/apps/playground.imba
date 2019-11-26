tag app-root
	def render
		<self>
			<button :click.flip> "flip"
			<div> <span> "Hello {Math.random()}"
			<div>
			if value
				<a.ontrue> "ontrue"

			if value
				<i.ontrue> "on1"
			else
				<b.onfalse> "on2"
