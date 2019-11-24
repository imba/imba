
var paths = require.context('raw-loader!./', true, /apps\/[\w\-]+\.imba$/)
var examples = {}

for src in paths.keys()
	var example = {
		path: src.slice(2)
		body: paths(src).default
	}
	examples[src.slice(2)] = example

require('../src/imba/index.imba')
require('./spec.imba')

var compiler = window.imbac

window.SELF = {
	test: window.test,
	describe: window.describe,
	eq: window.eq,
	ok: window.ok,
	spec: SPEC
}

var exposed = {}

window.onerror = do |e|
	console.log('page:error',{message: e.message})

window.onunhandledrejection = do |e|
	console.log('page:error',{message: e.reason.message})

var run = do |js|
	# hack until we changed implicit self behaviour
	js = js.replace('self = {}','self = SELF')
	window.eval(js)

	if SPEC.blocks.length
		exposed.test = SPEC.run.bind(SPEC)

		for block in SPEC.blocks
			# FIXME spec runner need to setup observer
			exposed[block.name] = do block.run()

	imba.commit()
	console.log('example:loaded',10)

var compileAndRun = do |example|
	var result = compiler.compile(example.body,{
		sourcePath: example.path,
		target: 'web'
	})
	var js = result.js
	run(js)

var load = do |src|
	if examples[src]
		compileAndRun(examples[src])

tag test-runner

	def go e
		document.location.hash = "#{e.target.value}"
		document.location.reload()

	def call e
		exposed[e.target.value]()
		self

	def render
		<self>
			<select :change.go>
				for src in Object.keys(examples)
					<option> src

			for name in Object.keys(exposed)
				<button value=name :click.call> name

imba.mount(<test-runner>)

window.onload = do
	var hash = (document.location.hash || '').slice(1)
	load(hash) if hash