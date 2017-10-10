var Imba = require ".."
var puppeteer = require "puppeteer"
var path = require "path"

var browser = await puppeteer.launch
var page = await browser.newPage

var consoleMapping = {
	startGroup: 'group'
	endGroup: 'groupEnd'
}

page.on 'console' do |msg|
	var stringArgs = msg:args.map(do $1.toString)
	var key = consoleMapping[msg:type] or msg:type
	console[key].apply(console, stringArgs)

	if var m = msg:text.match(/(\d+) OK.* (\d+) FAILED.*(\d+) TOTAL/)
		var failed = Number(m[2])
		process:exit(failed == 0 ? 0 : 1)

page.goto("file://" + path.resolve(__dirname, "index.html"))
