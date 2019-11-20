var puppeteer = require "puppeteer"
var path = require "path"
var fs = require "fs"
var Imba = {}
var browser

def run item
	var src =  "http://localhost:8125/apps/index.html#{item}"
	console.log "run",src
	var page = await browser.newPage()

	page.on 'load' do |msg|
		console.log("loaded page",item)

	page.on 'console' do |msg|
		console.log("page on console",msg._type)

	page.goto(src)


def main
	browser = await puppeteer.launch()

	var entries = fs.readdirSync(path.resolve(__dirname,"apps"), withFileTypes: true)
	var examples = entries.filter(|dir| dir.name.indexOf('.imba') >= 0 ).map(|v| v.name )

	for item in examples
		await run(item)

main()