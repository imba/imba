

import { ImbaDocument,lexer,M, SymbolKind } from '../../program'
window.LEXER = lexer
import {files} from './files'

lexer.stats = do
	let rows = []
	let statestats = []
	for own name,rules of lexer._lexer.tokenizer
		let state = {
			name: name
			time: 0
			count: 0
		}

		for rule in rules
			let s = rule.stats
			state.time += s.time
			state.count += s.count
			if s.count > 0
				let reg = rule.name.slice(rule.name.indexOf(': ') + 2)
				reg = reg.replace(/anyIdentifier/g,'id')
				# continue unless rule.string

				rows.push({
					state: name
					# rule: rule.regex
					raw: reg
					regex: rule.regex
					tot: Math.floor(s.time * 1000)
					avg: Math.floor((s.time * 100000) / s.count)
					count: s.count
					hits: s.hits
				})

	rows = rows.sort do(a,b) return b.tot - a.tot
	console.table(rows)

class EditableEvent < CustomEvent

const replacements = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

const typenames = {
	'[': 'square open'
	']': 'square close'
	'{': 'curly open'
	'}': 'curly close'
	'(': 'paren open'
	')': 'paren close'
}

def escape str
	str.replace(/[\&\<\>]/g) do(m) replacements[m]

def classify types
	types.join(' ').replace(/[\[\]\{\}\(\)]/g) do(m) typenames[m]

def highlight tokens
	let parts = []
	# console.log(tokens)
	let depth = 0
	let counter = 0
	let ids = []
	# tokens = analyze(tokens)
	let semantic

	for token in tokens
		let value = token.value
		let types = token.type.split('.')
		let [typ,subtyp] = types
		let mods = token.mods
		let sym = token.symbol

		if sym and sym.scoped?
			let symkind = sym.semanticKind
			
			let id = ids.indexOf(sym)
			if id == -1
				id = ids.push(sym) - 1

			mods |= sym.semanticFlags
			types.push('__ref')
			types.push(symkind+'_')
			types.push('symbol--'+id)

		if mods
			for own k,v of M
				if k.match(/^[a-z]/) and mods & v
					types.push(k+'_')

		if subtyp == 'start' or subtyp == 'open'
			parts.push("<b class='{typ}'>")
			continue unless value

		if (subtyp == 'end' or subtyp == 'close') and !value
			parts.push('</b>')
			continue

		if typ == 'push'
			value = String(++depth)
			let kind = subtyp.indexOf('_') >= 0 ? 'group' : 'scope'
			let end = token.scope && token.scope.end
			parts.push("<div class='{kind}-{subtyp.split('_').pop!} _{subtyp} l{depth} o{token.offset} e{end && end.offset}'>")
			continue
		elif typ == 'pop'
			value = String(--depth)
			parts.push("</div>")
			continue

		if typ != 'white' and typ != 'line'
			value = "<i class='{classify types} o{token.offset}'>{escape(value or '')}</i>"
		elif typ == 'white' and value != '\n'
			value = "<i raw='{JSON.stringify(value)}'>{escape(value or '')}</i>"

		parts.push(value)

		if subtyp == 'end' or subtyp == 'close'
			parts.push('</b>')

	return parts.join('')


# let content = migrateLegacyDocument(sample.body)
# let original = ImbaDocument.tmp(sample)
# let doc = new ImbaDocument('/source.imba','imba',1,sample)
# let outline
# = utils.fastExtractSymbols(sample)
# let fullOutline = utils.fastExtractSymbols(sample)
# let x = 1,y = 2
# console.log outline
# console.log 'parsed:',doc.parse!

tag outline-part

	<self[ff:mono fs:sm]>
		<[d:hflex]>
			<[pr:1 c:gray5]> SymbolKind[data.kind]
			<.name> data.name

		<[pl:4].children> for child in data.children
			<outline-part data=child owner=data>

tag app-root
	hlvar = null
	outline = null
	
	set file file
		if _file =? file
			file.doc ||= ImbaDocument.from(file.path,'imba',1,file.content)
			$code.innerHTML = highlight(doc.parse!)
			$code.innerHTML = highlight(doc.parse!)
			outline = doc.getOutline!
			# console.log doc.getNavigationTree!
			# console.log doc.getSemanticTokens!
			console.log doc.getSemanticTokens!
			console.log doc.getEncodedSemanticTokens!
	
	get file
		_file

	get doc
		_file.doc

	def reselected e\Event
		setTimeout(&,20) do
			# doc.parse!
			let sel = window.getSelection!
			let range = sel.getRangeAt(0)
			let off = range.cloneRange!
			off.setStart(document.querySelector('pre code'),0)

			let loc = off.toString!.length
			let token = doc.tokenAtOffset(loc)
			let ctx = doc.contextAtOffset(loc)

			console.warn doc.patternAtOffset(loc)

			if ctx
				console.group 'context'
				for own k,v of ctx
					let t = typeof v
					if t == 'number'
						console.log k,v
					if t == 'string'
						console.log k,[v]
				console.log 'before',ctx.before
				console.log 'after',ctx.after
				console.log 'token',ctx.token
				console.log 'scope',ctx.scope
				console.log 'group',ctx.group.name,ctx.group
				console.log 'suggest',ctx.suggest
				console.log 'vars',doc.varsAtOffset(loc,true)
				let st = token.stack
				while st
					console.log st.depth,st.state
					st = st.parent
				console.groupEnd!
				window.grp = ctx.group
				window.c = ctx
			
			console.log doc.adjustmentAtOffset(loc)
	
	
	def pointerover e
		let vref = null
		if let el = e.target.closest('.__ref')
			vref = el.className.split(/\s+/g).find do (/symbol--\d+/).test($1)
		
		if vref != hlvar
			if hlvar
				el.classList.remove('highlight') for el in getElementsByClassName(hlvar)
			if vref
				el.classList.add('highlight') for el in getElementsByClassName(vref)
			hlvar = vref
	
	def mount
		window.onhashchange = do
			let src = window.location.hash.slice(1)
			let match = files.find do $1.path == src
			console.log 'found match?',src,match,files
			if match
				file = match

		window.onhashchange!
		file ||= files[0]
		render!

	def profile dur = 1000, prof = no
		console.log 'starting profile',dur
		console.profile('parse')
		bench(dur,prof)
		console.profileEnd('parse')
		lexer.stats!
		self

	def bench dur = 1000, prof = no, cb
		lexer._profile = prof
		let count = 0
		let tot = 0
		let t0 = global.performance.now!
		while tot < dur
			let n = global.performance.now!
			cb ? cb() : doc.reparse!
			count++
			let t1 = global.performance.now!
			if (t1 - t0) > dur
				tot = t1 - t0
				break
			tot += t1 - n
		console.log 'avg',tot,tot / count

	def benchProfile
		bench(1000,no) do doc.getOutline!
			
	def render
		<self.hbox.grow[ff:sans]>
			<button @click=bench(2000,no)> 'bench'
			<button @click=bench(1,no)> 'once'
			<button @click=profile(2000,no)> 'profile'
			<button @click=profile(1000,yes)> 'measure'
			<button @click=benchProfile> 'outline'
			<div> for item in files
				<a[mr:2 c:white] href="#{item.path}"> item.path
			<pre @selectstart=reselected  @pointerover=pointerover>
				<code$code contentEditable='true' spellcheck=false>
			if outline
				<outline-part data=outline>
			# <pre> <code innerHTML=highlight(original.getTokens!) contentEditable='true' spellcheck=false>

imba.mount <app-root>

global css @root
	--token: #E3E3E3;
	--identifier: #9dcbeb;
	--background: #282c34;
	--comment: #718096;
	--keyword: #e88376;
	--operator: #e88376;
	--numeric: #63b3ed;
	--boolean: #4299e1;
	--null: #4299e1;
	--entity: #8ab9ff;
	--variable: #e8e6cb;
	--string: #c6f6d5;
	--entity: #8ab9ff;
	--regexp: #e9e19b;
	--this: #63b3ed;
	--tag: #e9e19b;
	--tag-angle: #9d9755;
	--type: #718096;
	--property: #F7FAFC;
	--root-variable: #c5badc;

	--var-decl: blue3;
	tab-size: 4;

	i,b fw:500 font-style:normal

	*@focus
		outline: none

	body
		color: var(--token)
		background-color: var(--background)
		padding: 20px

	pre,code
		ff: 'Fira Code Light','Source Code Pro',monospace
		fw: bold
		fs: 13px/1.3
	
	pre div d:inline

	.variable td:underline dotted
	.invalid color: red
	.comment color: var(--comment)
	.regexp color:orange4
	i.tag color: var(--tag)
	.type color: var(--type)
	i.keyword,.argparam color: var(--keyword)
	.operator color: var(--operator)
	.property color: var(--property)
	.numeric,.number color: var(--numeric)
	.boolean color: var(--boolean)
	.null color: var(--null)
	.identifier color: var(--identifier)
	.variable color: var(--variable)
	.string color: var(--string)
	.path color: var(--string)
	.propname color: var(--entity)
	.this,.self color: var(--this)
	.tag.open,.tag.close color: var(--tag-angle)
	.variable.scope_root color: var(--root-variable)
	# .entity.name.class color: var(--entity)
	.entity c:green3
	.field c:blue3
	.unit c:red4
	.type c:purple5
	.uppercase c:teal3
	.decl c:yellow2 .def:green3
	.style c:purple2 .value:purple4 .property:pink4 .modifier:pink5
	.selector c:orange3
	.decorator c:blue5
	.key c:blue3
	.ivar c:blue4

	.entity c:hsl(211deg 100% 70%)
	.vref c:yellow2/85 .root:indigo4
	.variable_ c:yellow2/85
	.parameter_ c:yellow2/85
	.function_ c:yellow2/85
	.function_.declaration_ c:var(--entity)
	.variable_.root_ c:blue4
	.global_ c:#dfd589
	.type_ c:purple4
	.vref.root_ c:blue4
	.vref.global_ c:#dfd589
	.vref.import_ c:indigo4
	.vref.import_ c:indigo4
	# .vref.def_ c:green3
	.vref.class_ c:purple4
	.type_.declaration_ bdb:1px solid
	.entity.name.constructor c:var(--keyword)

	# .vref.decl bdb:1px solid
	.operator.key-value c:blue3
	# .push outline:1px solid green4 d:inline-block
	# .pop outline:1px solid red4 d:inline-block
	.highlight bg:yellow3/20
	.scope bg:gray3/2

	.group-sel bg:yellow3/10 br:sm
	.group-prop > .group-name bg:black/10 br:sm

