export class Todo
	constructor title
		title = title
		done = no

	def archive
		yes

	def toggle
		done = !done