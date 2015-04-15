var fs = require 'fs'

export var NODES = fs.readFileSync('/repos/imba/src/compiler/nodes.imba', 'utf8')
export var CLASSES = fs.readFileSync('/repos/imba/test/src/samples/classes.imba', 'utf8')
