import 'imba/spec'
# test do
let val = 0

# Should this only be run once?
global class Base
	base = (val += 1)

global class Logger
	logger = 1
	def log
		yes 

	@lazy get stuff
		[1,2,3,4]

global class Mixin < Base
	isa Logger
	mixin = 1
	get mixed
		'mixed'

global class Deep < Mixin
	isa Base

global class Model < Base
	model = 1
	isa Mixin

let item = new Model
L item.logger,item.mixin,item.mixed,item.log,item.warn,val

extend class Logger
	def warn
		yes

L item.warn,val



let deep = global.deep = new Deep
L deep.logger,deep.log,deep.base

test do
	eq Model.prototype.log, Logger.prototype.log



SPEC.run!