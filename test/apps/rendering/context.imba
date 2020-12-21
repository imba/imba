
tag app-item
	# the default value of label will be inherited
	# from the closest parent that has a label property
	prop label = #context.label

	def render
		<self> <span> label

test do
	let tree = <main label="inherited">
		<div>
			<app-item>
	eq tree.textContent, "inherited"

test do
	let tree = <div> <app-item label="direct">
	eq tree.textContent, "direct"
