global.L = console.log
global.E = do console.error(...$0); process.exit(1)

import 'colors'
import { program } from 'commander'
import { version } from './package.json'

program
	.name("binary-name")
	.description("CLI tool made with imba")
	.argument('<text>', 'text to log')
	.option('-c, --color <color>', 'color of logged string')
	.version(version)
	.showHelpAfterError!

def main
	program.parse!
	let opts = program.opts!
	let args = program.args
	let s = args[0]
	L s[opts.color] or s

main!
