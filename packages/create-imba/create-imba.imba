let p = console.log
let create = require './main.js'
let { program } = require 'commander'

program
	.description('Create a new imba project')
	.argument('[name]', 'Project name')
	.option('-t, --template [template]', 'Specify a template instead of selecting one interactively')
	.option('-y, --yes', 'Say yes to any confirmation prompts')
	.parse!

create program.args[0], program.opts!
