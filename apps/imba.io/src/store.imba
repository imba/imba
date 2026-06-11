import {highlight} from './util/highlight'
import * as CODICONS from 'imba-codicons'
import Locals from './util/locals'

import raw from '../data/content.json'
export {raw}

# export const raw = global['content.json']

export const files = []
export const paths = {}
export const groups = {}
export const types = {}
export const hrefs = {}
import API from './api'
import {SymbolFlags as S,ModifierFlags as M,CategoryFlags as C} from './util/flags'

import {QuickScore} from "quick-score"

global.paths = paths
global.files = files

let root = null
let counter = 1

const extToLanguage =
	js: 'javascript'
	html: 'html'

class Entry
	
	set dirty val
		if #dirty =? val
			imba.commit!

	get dirty
		#dirty
	
	set hasErrors val
		if #hasErrors =? val
			imba.commit!

	get hasErrors
		#hasErrors

	static def create data, parent
		let typ = types[data.type] or Entry
		let item = new typ($1,parent)
		if parent and parent.children
			parent.children.push(item)
		return item

	def constructor data, parent
		id = counter++
		dirty = no
		parent = parent
		data = data
		body = ''
		# Object.assign(self,data)
		name = data.name
		type = data.type
		kind = data.kind
		level = data.level
		meta = data.meta || {}
		html = data.html
		head = data.head
		desc = data.desc
		options = data.options or {}
		flags = (data.flags || []).concat("entry-{id}")
		flagstr = flags.join(' ')

		if options.href
			hrefs[#href = options.href] = self

		groups[type] ||= []
		groups[type].push(this)

		if data.children
			self.children = data.children.map do
				let typ = types[$1.type] or Entry
				let item = new typ($1,self)
				return item
		else
			self.children = []
		
		if self isa Doc or self isa Guide
			hrefs[href] = self

	get resources
		[]

	get locals
		#locals ||= Locals.for(path)
		
	get icon
		CODICONS.BOOK

	get legend
		data.legend

	get elements
		document.getElementsByClassName("entry-{id}")
	
	get path
		parent ? (parent.path + '/' + name) : ''

	get href\string
		#href or options.href or data.href or (parent ? parent.href + '/' + name : name)

	get title
		data.title or basename.replace(/\-/g,' ')

	get basename
		data.name.replace(/\.\w+$/,'')

	get navName
		data.title or title

	get qualifiedTitle
		title

	get folders
		children.filter(do $1 isa Dir)
	
	get files
		children.filter(do $1 isa File)
	
	get docs
		#docs or children.filter(do $1 isa Doc)

	get navItems
		#navItems or docs

	get sections
		children.filter(do $1 isa Section)

	get parts
		children.filter(do $1 isa Doc or $1 isa Section)

	get categories
		children.filter(do $1 isa Category)

	get descendants
		#descendants ||= children.reduce(&,[]) do
			$1.concat([$2]).concat($2.descendants)

	get parents
		#parents ||= parent.parents.concat(parent)
		
	get breadcrumb
		#nav ? #nav.breadcrumb : (parent ? parent.breadcrumb.concat(self) : [self])

	get prev
		return null unless parent
		prevSibling or parent.prev

	get next
		return null unless parent
		nextSibling or parent.next

	get tocTitle
		#tocTitle ||= data.title.replace(/\s*\(.*\)/g,'')
		
	get toc?
		options.toc or options["toc-pills"]
		
	get reference?
		parent and parent.name == 'reference'
		
	get pill?
		options.keyword or options.op or options['event-modifier'] or options.cssprop or options.cssvalue

	get prevSibling
		parent ? parent.children[parent.children.indexOf(self) - 1] : null

	get nextSibling
		parent ? parent.children[parent.children.indexOf(self) + 1] : null

	def childByName name
		children.find(do $1.name == name) or (doc ? doc.childByName(name) : null) #  and !($1 isa Section)
		
	def childByHead name
		children.find(do $1.head == name) #  and !($1 isa Section)
		
	get displayName
		head

	get searchTitle
		title

	get searchText
		searchTitle

	def matchRegex q
		no



export class File < Entry
	
	static def temporary code,lang = 'imba'
		let data = {
			body: code
			name: "{counter++}.{lang}"
			children: []
			meta: {}
		}
		return new self(data,null)
		
	constructor data, parent
		super
		$send = null
		body = originalBody = savedBody = data.body
		ext = data.ext or name.split('.').pop!
		uri = "file://{path}"
		# href = path.replace(/\.(\w+)$/,'')
		files.push(self)
	
	get highlighted
		hl ||= highlight(body,ext)

	get first
		children[0] and !html ? children[0].first : self

	get last
		children[children.length - 1] ? children[children.length - 1].last : self

	get replUrl
		if ext == 'imba'
			`{path}.html`
		else
			`{path}`

	get model
		if global.monaco and !_model
			_model = global.monaco.editor.createModel(body,extToLanguage[ext] or ext,uri)
			_model.$file = self
			_model.updateOptions(insertSpaces: false, tabSize: 4)
			_model.onDidChangeContent do
				body = _model.getValue!
				dirty = body != savedBody
				clearTimeout($send)
				$send = setTimeout(&,150) do
					root.updateFile(self)
		_model
		
	get complexity
		meta.complexity or body.length

	def overwrite body
		if body != self.body
			self.body = body
			dirty = self.body != savedBody

			if _model
				_model.setValue(body)
			root.updateFile(self)

	def sendToWorker
		if ext != 'md'
			# console.log 'sending file info to worker',path
			root.updateFile(self)
			# .postMessage({event: 'file', path: path, body: body})

	def save
		# try to save directly to filesystem
		if window.location.hostname == 'localhost'
			let payload = {path: data.fullPath,body:body}
			let headers = {'Accept': 'application/json','Content-Type': 'application/json'}
			let req = global.fetch('/save',method:'post',headers:headers, body: JSON.stringify(payload))
			let res = await req
			savedBody = body
	
		dirty = no

export class Guide < Entry

	get parents
		#parents ||= []

	get next
		null

	get prev
		null

export class Markdown < Entry
	
	def match query
		if searchText.indexOf(query) >= 0
			return yes
		return no

	get page
		parent isa Doc ? parent : parent.page
		

export class Doc < Markdown
	
	get page
		self
	get next
		nextSibling or parent.next
		
	get prev
		let target = prevSibling
		if !target and parent isa Doc
			return parent
			
		return target

export class Section < Markdown
	
	get href
		#href ||= parent isa Section ? "{parent.href}-{name}" : "{parent.href}#{name}"

	get hash
		#hash ||= href.split('#')[1]

	get qualifiedTitle
		"{page.title} > {title}"

	get searchTitle
		"{page.title} > {title}"
		# qualifiedTitle

	get shortSearchText
		title

	get searchText
		searchTitle
		# "{garbleText page.title} > {title}"

	# get href
	#	"{parent.href}#{name}"

export class Category < Entry

export class Dir < Entry
	examples

	constructor data, parent
		super

	get sections
		files

	get first
		children[0] ? children[0].first : self

	get last
		children[children.length - 1] ? children[children.length - 1].last : self

	def ls path
		let parts = path.replace(/(^\/|\/$)/,'').split('/')
		let item = self # fs[parts.shift()]

		for part,i in parts
			if let child = item.childByName(part)
				parts[i] = item = child
			else
				break

		return parts
	
	def find path
		let parts = self.ls(path)
		let last = parts[parts.length - 1]
		if last isa Entry
			return last
		return null

	get replUrl
		let index = childByName('index.html')
		let app = childByName('app.imba') or self.files[0]

		if app and app.body
			if let m = app.body.match(/\.listen\((\d+)\)/)
				let src = new URL(global.location.href)
				src.port = m[1]
				src.pathname = '/'
				src.hash = ''
				return String(src)
		if !index and app
			return app.replUrl

		return `{path}/{index ? index.name : app.basename + '.html'}`

export class Root < Dir
	service = null
	
	get parents
		#parents ||= []

	def connectToWorker sw
		service = sw
		await service.ready
		service.addEventListener('message') do(e)
			if e.data.length
				let [action,params] = e.data
				let result = null
				if self[action]
					result = await self[action](...params)
				e.ports[0].postMessage(result)

	def rpc action, ...params
		new Promise do(resolve,reject)
			const channel = new MessageChannel
			channel.port1.onmessage = do(event) resolve(event.data)
			service.controller.postMessage([action,params], [channel.port2])

	def registerSession id
		console.log 'registerSession',id
		self
	
	def updateFile file
		let raw = {name: file.name, path: file.path, body: file.body}
		let result = await rpc('updateFile',raw)

		for frame of document.getElementsByTagName('iframe')
			try
				let map = frame.contentWindow.ImbaFiles
				if map and map[file.path]
					# console.log 'iframe depends on file!',frame.src
					frame.contentWindow.location.reload!
		return
				

	def resolvePath path
		let alternatives = [path,path + '.imba',path + '/index.imba']
		for alt in alternatives
			let entry = find(alt)
			if entry
				return {name: entry.name, path: entry.path, body: entry.body}
		return null

	def register path, kind
		let entries = ls(path)
		# console.log 'entries!!',entries.slice(0),kind
		let last = entries[entries.length - 1]

		if last isa Entry
			return last

		for entry,i in entries
			let prev = entries[i - 1] or self

			if typeof entry == 'string'
				let data = {type: 'dir', name: entry}
				if i == entries.length - 1
					data.type = 'file'
					Object.assign(data,kind)
					yes
				
				entries[i] = Entry.create(data,prev)
		# console.log 'entries!!',entries
		return entries.pop!
		
	def findExamplesFor query
		let cache = (#examples ||= {})
		let key = String(query)
		return cache[key] if cache[key]

		let items = []
		let dir = find('/examples/api')
		for item in dir.children
			if query isa RegExp
				continue unless item.body.match(query)
			else
				continue if item.body.indexOf(query) == -1
			items.push(item)

		return cache[key] = items

	def mergeApiDocs
		return
		let root = find('/reference')

		for item in root.descendants when item.options.href
			let href = item.options.href
			if href.match(/^\/api/)
				# console.log 'matched api!',item
				if let symbol = API.lookup(href)
					# console.log "Linking {href}"
					symbol.#article = item
				else
					let par = API.lookup(href.replace(/\/[^\/]+$/,''))
					let sym = API.create({
						mods:0
						flags:0
						parent:par
						cat: C.Article
						name: item.head
						meta:{href:href, article: item}
					})
					# sym.#article = item
					# console.log 'new symbol',sym,item
		return

	def linkNavWithDocs
		let dir = find('nav')
		# console.log "found nav?!",dir
		for item in dir.descendants when item.options.doc
			let doc = find(item.options.doc)
			# console.log "found doc?",item.head,doc,item.href,item.options.doc,item.href
			item.doc = doc
			item.#docs = item.children
			doc.#nav = item
			doc.#href = item.href
			hrefs[item.href] = item
	
	def crawlExamples
		let dir = find('/examples/api')
		let items = dir.children.sort do(a,b) a.complexity > b.complexity ? 1 : -1
		for item in items
			for ref in item.meta.see
				let m
				if m = ref.match(/^(\@\w+)(?:\.([\w\-]+))?$/)
					if let entry = API.lookup(ref)
						entry.examples.add(item)

					if let ev = API.lookup(m[1])
						ev.examples.add(item)
				elif ref.match(/^style\./)
					let entry = API.lookup(ref)
					if entry
						entry.examples.add(item)
			yes

	get path
		''

types.file = File
types.dir = Dir
types.doc = Doc
types.category = Category
types.section = Section
types.guide = Guide

raw.name = ''
root = new Root(raw)
export const fs = root
export const api = API


root.crawlExamples!
root.mergeApiDocs!
root.linkNavWithDocs!

global.FS = fs
global.gr = groups

const hits = {}
let indices = {}

export def ls path
	if API.hrefs[path]
		return API.hrefs[path]

	if hrefs[path]
		return hrefs[path]

	unless hits[path]
		let hash = null
		[path,hash] = path.split('#')
		let parts = path.replace(/(^\/|\/$)/g,'').split('/') # .replace(/\#/g,'/')
		let item = fs # fs[parts.shift()]
		return null unless item

		for part,i in parts
			let child = item.childByName(part)
			if child
				item = child
			else
				return null

		if item and hash
			for child in item.descendants
				if child.hash == hash
					break item = child

		hits[path] = item
	
	return hits[path]

	return paths[path.replace(/\/$/,'')]

export def pathForUrl url
	let hits = []
	let parts = url.split('/')
	while parts.length
		let hit = ls(parts.join('/'))
		hits.unshift(hit) if hit
		parts.pop!

	return {
		path: hits
		page: hits[-1]
	}

export def find query, options = {}
	let t = Date.now!

	let cfg = {
		useSkipReduction2: do(str,query,remainingScore,searchRange,remainingRange,matchedRange,fullMatchedRange)
			let len = str.length
			let split = str.indexOf('.',remainingRange.location)
			if str.match(/TouchList|border-top-left/)
				console.log("use skip?",...$0,split)
			
			if len < 40
				return true

			
			return false

		wordSeparators: "-/\\:()<>%_.=&[]+ \t\n\r@"
		longStringLength: 40
		adjustRemainingScore2: do(str,query,remainingScore,skipped,searchRange,remainingRange,matchedRange)
			# console.log($0)
			if str.match(/TouchList|border-top-left/)
				console.log(...$0)
			return remainingScore * remainingRange.length
	}

	###
	string,
		query,
		remainingScore,
		skippedSpecialChar,
		searchRange,
		remainingSearchRange,
		matchedRange,
		fullMatchedRange
		

		string,
		query,
		remainingScore,
		searchRange,
		remainingSearchRange,
		matchedRange,
		fullMatchedRange
	###
	# let adjustRemainingScore = do()

	unless indices.all
		let all = []
		for item in API.descendants
			all.push(item)
		
		# should rather search pages resolved via /nav
		let docs = fs.find('docs').descendants.sort do $1.level > $2.level ? -1 : 1

		for item in docs
			all.push(item)

		indices.all = new QuickScore(all,{ keys: ['searchText','shortSearchText'], config: cfg})
	
	let index = indices.all

	# if query.match(/\./)
	# 	indices.api ||= if true
	# 		let all = API.descendants.filter do !$1.kind.css
	# 		new QuickScore(all,{ keys: ['searchPath'], config: cfg})
	# 	index = indices.api

	let hits = index.search(query)

	hits = hits.filter do $1.score > 0.1 or $2 < 4

	if query[0] == '@'
		hits = hits.filter do $1.item.event? or $1.item.stylemod? or $1.item.decorator?


	let seen = new Set
	let docs = []
	let finals = []

	for hit in hits
		seen.add(hit.item)

	for hit in hits
		# seen.add(hit.item)
		let par = hit.item.parent
		if par and seen.has(par)
			continue

		if hit.item isa Entry
			finals.push(hit)
		else
			finals.push(hit)
	
	# console.log query,hits,docs,finals
	return docs.concat(finals)

global.LS = ls