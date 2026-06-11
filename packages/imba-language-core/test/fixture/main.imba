export class Point
	prop x = 10
	prop y = 20

	def dist
		Math.sqrt(x * x + y * y)

export def greet name\string
	"hello {name}"

let wrong\number = "not a number"
