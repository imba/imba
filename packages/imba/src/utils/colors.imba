const colors = {
	reset: [0, 0]

	bold: [1, 22]
	dim: [2, 22]
	italic: [3, 23]
	underline: [4, 24]
	inverse: [7, 27]
	hidden: [8, 28]
	strike: [9, 29]

	black: [30, 39]
	red: [31, 39]
	green: [32, 39]
	yellow: [33, 39]
	blue: [34, 39]
	magenta: [35, 39]
	cyan: [36, 39]
	white: [37, 39]
	gray: [90, 39]
	grey: [90, 39]

	bright-red: [91, 39]
	bright-green: [92, 39]
	bright-yellow: [93, 39]
	bright-blue: [94, 39]
	bright-magenta: [95, 39]
	bright-cyan: [96, 39]
	bright-white: [97, 39]

	bg-black: [40, 49]
	bg-red: [41, 49]
	bg-green: [42, 49]
	bg-yellow: [43, 49]
	bg-blue: [44, 49]
	bg-magenta: [45, 49]
	bg-cyan: [46, 49]
	bg-white: [47, 49]
	bg-gray: [100, 49]
	bg-grey: [100, 49]

	bg-bright-red: [101, 49]
	bg-bright-green: [102, 49]
	bg-bright-yellow: [103, 49]
	bg-bright-blue: [104, 49]
	bg-bright-magenta: [105, 49]
	bg-bright-cyan: [106, 49]
	bg-bright-white: [107, 49]
}

let c = {}
for own name, [open, close] of colors
	c[name] = do '\x1b[' + open + 'm' + $1 + '\x1b[' + close + 'm'
export default c

for own name, [open, close] of colors
	String.prototype.__defineGetter__ name, do
		'\x1b[' + open + 'm' + this + '\x1b[' + close + 'm'

# console.log "Hello this is a {"blue".blue} string and a {"red".red} one and a {"green".green} one."
# console.log "Hello this is a {c.blue("blue")} string and a {c.red("red")} one and a {c.green("green")} one."
