import {greet} from './main'

export def pad text\string, len\number, char = ' '
	text + char + len

greet("hi")
greet()
pad("x", 2)

export def fancy-pad text\string, width\number
	pad(text, width)

fancy-pad("y", 3)
