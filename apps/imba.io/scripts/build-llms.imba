# Generates data/llms.json — machine-readable exports of the documentation
# for AI/LLM consumption: llms.txt, llms-full.txt, sitemap.xml, robots.txt
# and a per-page markdown map served at <href>.md by index.imba.

const fs = require 'fs'
const path = require 'path'

const root = path.resolve(__dirname,'..')
const contentDir = path.join(root,'content')
const dest = path.join(root,'data')
const changelogPath = path.join(root,'node_modules','imba','changelog.md')

const HOST = 'https://imba.io'
const imbaVersion = JSON.parse(fs.readFileSync(path.join(root,'node_modules','imba','package.json'),'utf8')).version

# nav.md defines the site structure: headings with [doc=...] [href=...] options,
# optionally followed by plain-text description lines.
def parseNav src
	let entries = []
	let current = null
	for line in src.split('\n')
		let m = line.match(/^(\#+)\s+(.*)$/)
		if m
			let opts = {}
			let title = m[2].replace(/\s*\[([\w\-]+)(?:\=([^\]]+))?\]/g) do(all,key,value)
				opts[key] = value or yes
				return ''
			current = {
				level: m[1].length
				title: title.trim!
				doc: opts.doc
				href: opts.href
				skip: !!opts.skip
				desc: ''
			}
			entries.push(current)
		elif current and line.trim!
			current.desc = (current.desc ? current.desc + ' ' : '') + line.trim!
	return entries

# prose lines (outside code fences)
def cleanProse line
	# make root-relative links absolute
	line = line.replace(/\]\(\//g,"]({HOST}/")

	if line.match(/^\#{1,6}\s/)
		# strip playground option tags like [preview=md] and inline html from headings
		line = line.replace(/\s*\[([\w\-]+)(?:\=[^\]]*)?\](?!\()/g,'')
		line = line.replace(/<\/?[a-zA-Z][^>]*>/g,'')
		return line

	# blockquote directives: > [tip box yellow] text -> > **Tip:** text
	let m = line.match(/^(\s*>\s*)\[([\w\s]+)\]\s*(.*)$/)
	if m
		let kind = m[2].split(' ')[0].toLowerCase!
		let label = kind == 'warn' ? 'Warning' : (kind == 'note' ? 'Note' : 'Tip')
		return "{m[1]}**{label}:** {m[3]}"

	# large-paragraph marker used by the site renderer
	line = line.replace(/^!\s+/,'')
	return line

def cleanDoc src
	let out = []
	let inFence = no
	for line in src.split('\n')
		if line.match(/^\s*```/)
			if inFence
				inFence = no
				out.push(line)
			else
				inFence = yes
				let m = line.match(/^(\s*)```\s*(\S*)/)
				# untagged code blocks are imba by convention
				out.push(m[2] ? line : "{m[1]}```imba")
			continue

		if inFence
			# drop playground meta lines and visible/hidden separators
			continue if line.match(/^\s*# \[[^\]]*\]\s*$/)
			continue if line.match(/^\s*# ---\s*$/)
			out.push(line.replace(/~\[/g,'').replace(/\]~/g,''))
		else
			out.push(cleanProse(line))

	let text = out.join('\n')
	text = text.replace(/\n{3,}/g,'\n\n')
	return text.trim! + '\n'

def docBody entry
	if entry.doc == 'changelog'
		return fs.readFileSync(changelogPath,'utf8')
	let file = path.join(contentDir, entry.doc + '.md')
	unless fs.existsSync(file)
		console.warn "missing doc file for {entry.title}: {entry.doc}"
		return null
	fs.readFileSync(file,'utf8')

###
Build everything
###

const navSrc = fs.readFileSync(path.join(contentDir,'nav.md'),'utf8')
const entries = parseNav(navSrc)

const sectionRenames = {'Imba Home': 'Getting started'}

let pages = {}
let sections = []
let fullParts = []
let sitemapUrls = ['/']

let section = null
for entry in entries
	continue if entry.skip

	if entry.level == 1
		section = {title: sectionRenames[entry.title] or entry.title, links: []}
		sections.push(section)

	if entry.href and sitemapUrls.indexOf(entry.href) < 0
		sitemapUrls.push(entry.href)

	continue unless entry.doc and entry.href

	let body = docBody(entry)
	continue unless body != null

	let cleaned = cleanDoc(body)
	pages[entry.href] = {title: entry.title, body: cleaned}
	section.links.push(entry) if section

	# the changelog is linked from llms.txt but too noisy for llms-full
	unless entry.doc == 'changelog'
		fullParts.push("---\n\nSource: {HOST}{entry.href}\n\n{cleaned}")

# llms.txt — index following the llmstxt.org convention
let lines = []
lines.push '# Imba'
lines.push ''
lines.push '> Imba is a friendly, full-stack programming language for the web that compiles to fast JavaScript. DOM elements and scoped CSS are first-class parts of the language, and declarative tag trees compile to a memoized DOM that outperforms virtual DOM approaches.'
lines.push ''
lines.push 'Notes:'
lines.push ''
lines.push '- Imba uses tabs for indentation. Code blocks in the docs are Imba unless tagged otherwise.'
lines.push '- Every page below is plain markdown. The same URL without the .md suffix serves the human version.'
lines.push "- The complete documentation in a single file: {HOST}/llms-full.txt"
lines.push "- Try code in the playground: {HOST}/try"

for sec in sections when sec.links.length
	lines.push ''
	lines.push "## {sec.title}"
	lines.push ''
	for link in sec.links
		let entry = "- [{link.title}]({HOST}{link.href}.md)"
		entry += ": {link.desc}" if link.desc
		lines.push entry

let llmsTxt = lines.join('\n') + '\n'

# llms-full.txt — the entire documentation as one markdown file
let fullHeader = "# Imba Documentation\n\n> Complete documentation for the Imba programming language (v{imbaVersion}), generated from {HOST}. Imba is a friendly, full-stack language for the web that compiles to fast JavaScript, with DOM elements and scoped CSS built into the language.\n\nNotes: Imba uses tabs for indentation. Code blocks are Imba unless tagged otherwise. Each section below lists its canonical URL — append .md to any of them for that page as markdown.\n"
let llmsFull = fullHeader + '\n' + fullParts.join('\n')

# sitemap.xml + robots.txt
let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for url in sitemapUrls
	sitemap += "\t<url><loc>{HOST}{url}</loc></url>\n"
sitemap += '</urlset>\n'

let robots = "User-agent: *\nAllow: /\n\nSitemap: {HOST}/sitemap.xml\n"

fs.mkdirSync(dest,recursive:yes)
let data = {version: imbaVersion, pages: pages, llms: llmsTxt, full: llmsFull, sitemap: sitemap, robots: robots}
fs.writeFileSync(path.join(dest,'llms.json'),JSON.stringify(data,null,2))

console.log "wrote data/llms.json ({Object.keys(pages).length} pages, llms.txt {llmsTxt.length} chars, llms-full.txt {llmsFull.length} chars)"
