let L = console.log

import clipboard from 'clipboardy'
import al from './styler.js'

let aliases = Object.fromEntries(Object.entries(al).map(do([a,b]) [b,a]))

let styles = clipboard.readSync!

let lines = styles.split '\n'
lines = lines.filter do(line)
	return unless line.trim!
	return if line.startsWith '/*'
	yes

let out = ''
for line in lines
	let [key, val] = line.slice(0,-1).split(/\s*:\s*/)
	out += "{aliases[key] or key}:{val}\n"

L out
clipboard.writeSync(out)
L 'COPIED TO CLIPBOARD'
