var Benchmark = require 'benchmark'

var suite = Benchmark.Suite.new

# add tests
suite.add('RegExp#test') do
	/o/.test('Hello World!')

suite.add('String#indexOf') do
	'Hello World!'.indexOf('o') > -1

suite.add('String#match') do
	!!'Hello World!'.match(/o/)

# add listeners
suite.on('cycle') do |event|
	console.log(String(event:target))

suite.on('complete') do
	console.log('Fastest is ' + this.filter('fastest').pluck('name'))

# run async
suite.run()

console.log "got here"