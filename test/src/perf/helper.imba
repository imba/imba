
var git  = require 'gift'
var benchmark = require 'benchmark'
var chalk = require 'chalk'
var fs = require 'fs'
var repo = git "/repos/imba"

def gitinfo cb
	repo.current_commit do |err,commit| cb(commit)

export class Benchmark

	def initialize name, o = {}
		@name = name
		@runner = benchmark.Suite.new o
		@commit = nil
		@runner.on('cycle') do |event|
			cycled event
			log(String(event:target))

		@runner.on('complete') do |e|
			log('Fastest is ' + this.filter('fastest').pluck('name'))
			completed e

		return self

	def log str
		console.log str
		self

	def start
		# log "starting benchmark at {@commit:message}"
		self

	def cycled e
		# console.log e
		self

	def completed
		# log "completed"
		# console.log @runner
		var lines = []
		var json = {
			name: @name
			commit: "{@commit:id} - {@commit:message}"
			tests: []
		}

		for item,i in @runner
			json:tests.push("{item:hz.toFixed(0)} - {item:name}")
			# console.log "item {item} {item:hz}"
			# lines.push "{@commit:id}"

		# console.log JSON.stringify(json)

		# write to file
		fs.appendFile("{__dirname}/results.log", JSON.stringify(json,null,4) + '\n') do true
		self

	def add name, blk, o = {maxTime: 4}
		@runner.add name, blk, o
		self

	def run
		gitinfo do |commit|
			@commit = commit
			start
			@runner.run
		self
