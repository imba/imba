import {SymbolFlags as S,ModifierFlags as M,CategoryFlags as C} from './util/flags'
import * as CODICONS from 'imba-codicons'
import Locals from './util/locals.imba'
export const MAP = {}
let t = Date.now!
global.apimap = MAP
let idcounter = 0

def hrefToEntities url
	let hits = []
	let parts = url.split('/')
	while parts.length
		let hit = MAP[parts.join('/')]
		hits.unshift(hit) if hit
		parts.pop!

	return hits

def garbleText text
	text.replace(/\w/g,'J')

export const icons = {
	down: CODICONS.ARROW_SMALL_DOWN
	up: CODICONS.ARROW_SMALL_UP
	left: CODICONS.ARROW_SMALL_LEFT
	right: CODICONS.ARROW_SMALL_RIGHT
	record: CODICONS.RECORD
	entity: CODICONS.SYMBOL_NAMESPACE
	interface: CODICONS.SYMBOL_CLASS
	ns: CODICONS.SYMBOL_NAMESPACE
	method: CODICONS.SYMBOL_METHOD
	function: CODICONS.SYMBOL_METHOD
	variable: CODICONS.SYMBOL_VARIABLE
	property: CODICONS.SYMBOL_FIELD
	accessor: CODICONS.SYMBOL_FIELD
	style: CODICONS.SYMBOL_ENUM
	event: CODICONS.MENTION
	modifier: CODICONS.SYMBOL_EVENT
	enum: CODICONS.SYMBOL_ENUM
	option: CODICONS.SYMBOL_ENUM_MEMBER
}

export const cssicons = Object.assign({},icons,{
	property: CODICONS.SYMBOL_ENUM
	modifier: CODICONS.SYMBOL_NAMESPACE
	
})

class Matcher
	static map = {}
	static def for raw
		map[raw] ||= new self(raw)

	def constructor query
		#query = query
		# check for regexp
		if query.match(/[\^]/)
			#regexp = new RegExp(query)
			match = do(item) !!item..matchRegex(#regexp)
		else
			match = match.bind(self)

	
	def match item\Entity
		if item.kind.#str.indexOf(#query) >= 0
			# console.log "matched {item.kind.#str} {#query}"
			return yes
		return no

class Kind

	static def for raw
		let key = "{raw.flags or 0}.{raw.mods or 0}.{raw.cat or 0}"
		self[key] ||= new self(raw.flags,raw.mods,raw.cat)

	def constructor flags,mods,cat
		let str = "entity"
		str += " css" if cat & C.CSS
		str += " article" if cat & C.Article
		str += " decorator" if cat & C.Decorator
		str += " accessor" if flags & S.PropertyOrAccessor
		str += " property" if flags & S.Property
		str += " function" if flags & S.Function and !(cat & C.Decorator)
		str += " variable" if flags & S.Variable
		str += " method"   if flags & S.Method
		str += " modifier" if flags & S.Modifier
		str += " interface" if flags & (S.Interface | S.Class)
		str += " ns" if flags & S.Namespace
		str += " event" if flags & S.Event
		str += " custom" if mods & M.ImbaSpecific
		str += " native" unless mods & M.ImbaSpecific
		str += " readonly" if mods & M.Readonly
		str += " abstract" if mods & M.Abstract
		str += " experimental" if mods & M.Experimental
		str += " upcase" if mods & M.Upcase
		str += " enum" if flags & S.Enum
		str += " option" if flags & S.EnumMember
		str += " easing" if cat & C.CSSEasing
		str += " transform" if cat & C.CSSTransform
		#str = str
		#flags = {}
		for key in str.split(" ")
			self[key] = #flags[key] = yes
		self

	get icon
		#icon ||= if true
			let m = self
			let group = #flags.css ? cssicons : icons
			#str.split(" ").reverse!.map(do group[$1]).find(do !!$1)

	def toString
		#str

	def match str
		self

class Members < Array
	
	def constructor owner, items = [], filters = {}
		super(...items)
		#owner = owner
		#filters = filters
		#cache = {}
		self
		
	get owner
		#owner

	get filters
		#filters
	
	get all
		self

	get modifiers do filter(&,'modifier') do $1.modifier?
	get decorators do filter(&,'modifier') do $1.decorator?
	get variables do filter(&,'variable') do $1.variable?
	get functions do filter(&,'function') do $1.function?
	get properties do filter(&,'property') do $1.property?
	get cssvalues do filter(&,'cssvalue') do $1 isa StyleValueEntity
	get methods do filter(&,'method') do $1.method?
	get accessors do filter(&,'accessor') do $1.accessor?
	get setters do filter(&,'setter') do $1.accessor? and !$1.kind.readonly
	get getters do filter(&,'getter') do $1.getter?
	get events do filter(&,'event') do $1.event?
	get custom do filter(&,'custom') do $1.custom?
	get easing do filter(&,'easing') do $1.ease?
	get preferred do filter(&,'preferred') do $1.preferred?
	get options do filter(&,'option') do $1.kind.option
	get native do filter(&,'native') do !$1.custom?
	get domprops do filter(&,'domprops') do $1.tags.idl
	get interfaces do filter(&,'interface') do $1.interface?
	get namespaces do filter(&,'namespace') do $1.ns?
	get idl do filter(&,'idl') do $1.tags.idl
	get enums do filter(&,'enum') do $1.kind.enum

	get sorted
		#sorted('name') do self.sort do $1.name > $2.name ? 1 : -1
		
	get own
		filter(&,'own') do $1.isOwnedBy(#owner)
		
	get inherited
		filter(&,'inherited') do $1.owner != #owner and get($1.name) == $1
	
	get unique
		filter do self.get($1.name) == $1

	def #sorted key, cb
		return self if #filters.sort == key
		return #cache[key] ||= new Members(#owner,cb(),Object.assign({},#filters,{sort:key}))

	def filter cb,name
		
		if typeof cb == 'string'
			# filter based on the kind flags
			let matcher = Matcher.for(cb)
			cb = matcher.match

		if name
			return self if #filters[name]
			return #cache[name] ||= new Members(#owner,super(cb),Object.assign({},#filters,{[name]:1}))

		new Members(#owner,super(cb),Object.assign({},#filters))

	def get name
		find do $1.name == name
	
	get grouped
		let all = unique
		[all.own,all.inherited]

extend class Array
	get own
		self
	
	get inherited
		self


export class Entity
	name
	meta = {}
	flags = 0
	mods = 0
	cat = 0
	proxy\Entity = null
	parent\Entity = null
	inherits\Entity = null
	implements\Entity[] = []
	implementors\Entity[] = []
	# inheritors\Entity[] = []
	valuetype\Entity = null
	examples = new Set
	members = []

	def constructor raw,kind
		super(raw)
		kind = kind

		id = "ent{idcounter++}"

		if parent
			parent.members.push(self)

		if event? and valuetype
			valuetype.members.push(self)

		if inherits
			let curr = inherits
			while curr
				curr.inheritors.push(self)
				curr = curr.inherits

		for item in implements
			item.implementors.push(self)

		if proxy
			proxy.shorthand = self			
		
		# MAP[qualifiedName] = self
		MAP[href] = self

		for path in paths
			MAP[path] = self
		self

	get inheritors
		#inheritors ||= new Members(self,[],{own:1})

	get paths
		[]

	get locals
		#locals ||= Locals.for(href)

	get guide
		global.FS.find('/reference').childByHead(href)

	get resources
		[]

	get api? do yes
	get flagstr do String(kind)
	get icon do #icon or kind.icon
	get css? do (cat & C.CSS) != 0
	get ns? do flags & S.Namespace
	get global? do !parent or !parent.parent
	get interface? do flags & (S.Interface | S.Class) and !css?
	get method? do (flags & S.Method) != 0
	get variable? do (flags & S.Variable) != 0 and !interface?
	get function? do (flags & S.Function) != 0
	get decorator? do (cat & C.Decorator) != 0
	get property? do (flags & S.Property) != 0 or accessor?
	get modifier? do (flags & S.Modifier) != 0
	get event? do (flags & S.Event) != 0
	get getter? do (flags & S.GetAccessor) != 0
	get accessor? do (flags & S.PropertyOrAccessor) != 0
	get member? do method? or property?
	get callable? do method? or function?
	get custom? do (mods & M.ImbaSpecific) != 0
	get readonly? do (mods & M.Readonly) != 0
	get upcase? do (mods & M.Upcase) != 0

	get cssprop? do (cat & C.CSSProperty) != 0
	get cssmodifier? do (cat & C.CSSModifier) != 0

	get desc
		meta.desc
	
	get summary
		meta.summary or (meta.desc and meta.desc.length < 150 ? meta.desc : '')

	get owner
		parent

	get proto
		inherits
	
	get protos
		proto ? proto.protos.concat(proto) : []

	def get key
		members.find do $1.name == key

	get breadcrumb
		#breadcrumb ||= hrefToEntities(href)
		# !parent ? [self] :  parent.breadcrumb.concat(self)

	def isOwnedBy val
		return yes if event? and valuetype == val
		owner == val
	
	def lookup key
		key = key.replace(/^global(This)?\./,'')
		let parts = key.split('.')
		let source = self

		while source and parts[0]
			let key = parts.shift!

			if key[0] =='#' and source isa Members
				let cat = key.slice(1)
				source = source.filter do $1.meta[cat]
				continue


			let res = source[key]
			if res isa Members
				source = res
			elif !res
				source = source.all.find do $1.name == key

		return source
		# properties.find do $1.name == key
	
	get displayName
		name

	get shortName
		name

	get navName
		displayName
	
	get urlName
		name
	
	get alias
		meta.alias

	get searchTitle
		# global? ? (ns? ? name : "global.{name}") : parent.searchTitle + ".{displayName}"
		searchPath # searchPath.replace(/\./g,' ')
		# searchPath

	get searchPath
		global? ? ((ns? or interface?) ? name : "global.{name}") : parent.searchPath + ".{displayName}"

	get searchText
		return searchPath

		unless global?
			return (garbleText parent.searchPath) + ".{displayName}"
		displayName

	def matchRegex regex
		name.match(regex)

	get qualifiedName
		global? ? name : parent.qualifiedName + ".{displayName}"

	get qualifier
		global? ? '' : parent.qualifiedName

	get detail
		meta.detail or ''

	get href
		#href ||= parent.href + "/" + global.escape(urlName)
		# "/api/" + qualifiedName.replace(/\./g,'/')

	get own
		#own ||= new Members(self,members,{own:1})

	get mdn
		if global? and !kind.custom
			if meta.dom
				return "https://developer.mozilla.org/en-US/docs/Web/API/{name}"
			else
				return "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/{name}"

		if member? and !custom? and !parent.custom? and parent.mdn
			return parent.mdn + "/{name}"

	get all
		#all ||= if true
			let arr = []
			let mapped = {}
			

			if inherits
				for el in inherits.all
					mapped[el.name] = el
					arr.push(el)

			let add = do(item)
				if let overloaded = mapped[item.name]
					arr.splice(arr.indexOf(overloaded),1)
					item.overload = overloaded

				arr.push(item)

			
			for item in members
				add(item)
				
			for mix in implements
				for item in mix.members
					add(item)
				# arr.push(...mixin.members)
			new Members(self,arr)


class GlobalEntity < Entity

	get href
		"/api"

	get qualifiedName
		"global"

	get navName
		"API"

class InterfaceEntity < Entity
	get modifiers
		#modifiers ||= all.modifiers

	get mdn
		if global? and !kind.custom
			if meta.dom
				"https://developer.mozilla.org/en-US/docs/Web/API/{name}"
			else
				"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/{name}"
		

# class EventEntity < Entity

class EventEntity < Entity
	get qualifier
		''

	get href
		"/api/Element/@{name}"
	
	get modifiers
		#modifiers ||= valuetype.all.modifiers
		# new Members(self,[])

	get labelName
		"event"

	get searchPath
		"@{name}"

	get mdn
		return if kind.custom
		"https://developer.mozilla.org/en-US/docs/Web/API/Element/{name}_event"

class ModifierEntity < Entity
	get urlName
		"{displayName}"

	get href
		# "{owner.href}/modifiers/{displayName}"
		"/docs/events/modifiers/{owner.name}.{displayName}"

	get qualifier
		''

	get displayName
		name.slice(1)

class DecoratorEntity < Entity
	get urlName
		"{displayName}"

	get qualifier
		''

	get displayName
		name

class StyleEntity < Entity

	get qualifiedName
		displayName

	get searchPath
		displayName

class StyleModifierEntity < StyleEntity
	
	get labelName
		"css modifier"

	get href
		"/docs/css/modifiers/{name}"

	get paths
		["style.modifier.{name}"]

class StylePropertyEntity < StyleEntity

	get labelName
		"css property"

	get urlName
		"{displayName}"

	get preferred?
		return yes

	get href
		"/docs/css/properties/{name}"
	
	get paths
		["style.property.{name}","style.property.{alias or name}"]

	get qualifiedName
		name # "css {name}"

	get shortName
		alias or name

	get qualifier
		"css "

	get detail
		# return " / {shorthand.name}" if shorthand
		return " / {alias}" if alias
		return ""

	def matchRegex regex
		name.match(regex)

	get main
		proxy or self

	get mdn
		return if kind.custom
		# and !proxy
		# let name = proxy ? proxy.name : name
		"https://developer.mozilla.org/en-US/docs/Web/CSS/{name}"

# class StyleTypeEntity < StyleEntity

class StyleTypeEntity < StyleEntity

	get href
		"/docs/css/values/{global.escape name}"

	get paths
		["style.type.{name}"]

	get displayName
		"<{name}>"

	get qualifiedName
		displayName

	get labelName
		"css data type"

	get mdn
		return if kind.custom
		"https://developer.mozilla.org/en-US/docs/Web/CSS/{name}_value"


class StyleValueEntity < StyleEntity

	get displayName
		# only for display etc?
		if parent isa StyleTypeEntity
			name
		else
			"{parent.shortName}:{name}"

	get searchPath
		displayName
		# "{parent.displayName}: {displayName}"

	get labelName
		parent.displayName + " value"
	


class ArticleEntity < Entity

	get href
		meta.href

	get guide
		meta.article
	
def build raw
	let cls = Entity
	let kind = Kind.for(raw)

	if kind.interface
		# console.log 'found interface',kind
		# if raw.flags & (S.Interface | S.Class)
		cls = InterfaceEntity
	if kind.event
		cls = EventEntity
	if kind.modifier
		cls = ModifierEntity 
	if !raw.parent
		cls = GlobalEntity
	
	if kind.css
		cls = StyleEntity

		if kind.property
			cls = StylePropertyEntity
		elif kind.modifier
			cls = StyleModifierEntity
		elif kind.enum
			cls = StyleTypeEntity
		elif kind.option
			cls = StyleValueEntity
	
	if kind.article
		cls = ArticleEntity

	return new cls(raw,kind)

const all = global.$api({},build)
# console.log "api took",Date.now! - t
global.api2 = all

const root = new class
	root = all[0]
	hrefs = MAP

	get descendants
		all

	def create raw
		build(raw)

	def path url
		let hits = []
		let parts = url.split('/')
		while parts.length
			let hit = MAP[parts.join('/')]
			hits.unshift(hit) if hit
			parts.pop!
		
		return hits
			
	def lookup path
		if MAP[path]
			return MAP[path]
			
		if let m = path.match(/^(\@\w+)(?:\.([\w\-]+))?$/)
			let path = "/api/Element/{m[1]}"
			if m[1] == '@event'
				path = "/api/Event"

			if let ev = MAP[path]
				if m[2]
					return ev.modifiers.get("@{m[2]}")
				return ev
		
		return root.lookup(path)
		return null

	def get path
		if MAP[path]
			return MAP[path]

		root.lookup(path)

	def getEvent name
		let ref = "/api/Element/@{name.replace('@','')}"
		if name == 'event'
			ref = "/api/Event"
		MAP[ref]
		
	def getEventModifier evname,modname
		let ev = getEvent(evname)
		if ev
			ev.modifiers.find(do $1.displayName == modname)
		
	def getStyleProperty name
		return

	def inferTypeForToken tok
		if tok.match('self')
			return tok.context.selfScope.selfPath

		if tok.match('accessor')
			# let lft = tok.prev.prev
			return [inferTypeForToken(tok.prev.prev),tok.value]

		if tok.match('identifier')
			let sym = tok.symbol
			# what if it is inside an object that is flagged as an assignment?			
			if tok.value == 'global'
				return 'globalThis'

			if sym and sym.datatype
				return sym.datatype
			
			if !sym
				let scope = tok.context.selfScope

				if tok.value == 'self'
					return scope.selfPath

				if tok.value[0] == tok.value[0].toLowerCase!
					return "{scope.selfPath}.{tok.value}"
			
			# console.log 'found identifiyer!',tok,tok.symbol
			return "globalThis.{tok.value}"

		
	def getEntityForToken token
		let entity
		
		if token.type == 'tag.event.name'
			entity = getEvent(token.value)
		elif token.type == 'tag.event-modifier.name'
			let evname = token.context.name
			let modname = token.value
			entity = getEventModifier(evname,modname)
		elif token.type == 'style.property.name'
			entity = lookup("style.property.{token.value}")
			
		elif token.type == 'style.property.modifier' or token.type == 'style.selector.modifier'
			entity = lookup("/docs/css/modifiers/{token.value}")

		if !entity
			let path = inferTypeForToken(token)
			# console.log "inferred type",path
			if path isa Array
				path = path.join(".")
			if path
				try
					return root.lookup(path)
		
		return entity

global.api = root
export default root