import type { ManualSub } from './manualglobal'
import { Local } from './local'
import { LateDefJS } from './def2'

let m = new SomeClass
m.ext
m.that.extthis
m.num
let m1x = m.extthis!

let m2 = new LateDefJS
m2.ext
m2.that.ext

let m3 = new Local
m3.ext
m3.state.three
m3.localState.one

let m4 = new ImmediateDefJS
m4.ext
let other = m4.ext()
m4.that.ext
m4.main
other.ext2

"tester".plural

m3.state

let m5 = <app-panel>
m5.main
m5.ext
global.appState.one
m3.state.one
m.state.one
m3.element.main

m5.that.ext

let str = "Hello"
# str.stuff
str.test
str.tast
str.element2.ext
str.el3.hello
str.singular

let m8 = new GlobalSomeClass
m8.main
m8.tata
m8.that.main

let m9 = new GlobalSubClass
m9.main
# m9.that.moon

let m10\SomeClass
let m11\GlobalSomeClass

let m12 = new AutoGlobal

m12.main
m12.that.main

let m13\AutoGlobal

m13.main

let m14\SomeSubClass

m14.that.sub.num

SomeClassExt
SomeClass
Number

global.SomeClassExt

global class MainStuff

	def render
		yes


tag app-main

	data\InstanceType<SomeClass>
	
	data2\GlobalSomeClass
	data3\InstanceType<typeof GlobalSubClass>
	data4\InstanceType<typeof SomeClass>
	data5\SomeClass
	data9\ManualSub
	data10\ManualGlobal

	def mount
		space
		space.ext
		smeth
		spuce
		state # elstate
		data.main
		data2.that.main
		data3.that.main
		data4.that.main
		data5.that.main
		data9.main.that
		data10.main.that.that
		ManualGlobal.call
		ManualGlobal.stuff
		# ManualGlobal.main
		let x\ManualSub
		stuuff

		x.main
		other.main().ext
		[SomeClass]

		let el\<app-button>
		el.ext

	<self>
		<app-button>
		<input$text type='text'>
		