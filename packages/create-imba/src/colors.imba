# Minimal port of imba's internal colors util (src/utils/colors.imba) —
# extends String.prototype with just the ansi styles the scaffolder uses.

const colors =
	bold: [1, 22]
	red: [31, 39]
	green: [32, 39]
	yellow: [33, 39]
	blue: [34, 39]
	cyan: [36, 39]

for own name, [open, close] of colors
	# @ts-ignore
	String.prototype.__defineGetter__ name, do
		'\x1b[' + open + 'm' + this + '\x1b[' + close + 'm'
