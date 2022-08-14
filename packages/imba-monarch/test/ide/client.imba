import txt from '../sample.txt'
import Script,{Node,Token} from '../../index'

const replacements = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
}

def escape str
	str.replace(/[\&\<\>]/g) do(m) replacements[m]

class State
	doc
	focus = null
	hover = null

	set loc val
		if #loc =? val
			context = doc.getContextAtOffset(val)
			focus = context.token
			window.localStorage.setItem('loc',val)
			console.group("location {val} {context.before.line}**{context.after.line}")
			console.log(context)
			console.log(context.token)
			console.log(context.suggest)
			console.groupEnd()
			let vars = doc.varsAtOffset(val)
			console.log 'vars',vars
			window.doc = doc
			window.scop = context.scope
			window.ctx = context
			imba.commit!
	
	get loc
		#loc

	def constructor
		let code = window.localStorage.getItem('code') or txt
		owner = {fileName: "/a/b/index.imba"}
		doc = window.doc = new Script(owner,code)
		loc = parseInt(window.localStorage.getItem('loc') or '0')
		
const state = window.state = new State()

global css @root
	tab-size: 4
	ff:sans
	code
		counter-reset: depth 1 group 0
		cursor:default
		lh:1.6 fs:14px

		b bg:blue5/10
		div d:inline

	dl
		d:hflex g:1 my:1 ai:center
		dt d:inline-flex m:0 c:gray5
		dd m:0
	
	.str bg:green4/5 c:green4 p:2px ws:pre
	.num bg:blue4/5 c:blue4 p:1
	.arr d:hflex g:1

	span c:hue5 cursor:default
		@hover bg:blue5/20
	.br
		# outline:1px solid red3/30
		@after
			pos:absolute fs:8px
			content: "\\n"

	.push
		counter-increment:group 1
		c:green3
		@before
			pos:absolute fs:8px x:-50% y:-50%
			content: counter(depth)

	.push + *
		counter-increment:depth 1

	.pop
		# outline:1px solid blue3
		counter-increment:depth -1
		c:red3
		@before
			pos:absolute fs:8px x:-50% y:-50%
			content: counter(depth)
	
	.push + .pop
		counter-increment:depth 0

	.invalid hue:green bgc:rose7/20
	.comment hue:green
	.regexp hue:green
	.tag hue:amber
	.type hue:blue
	.keyword,.argparam hue:red
	.operator hue:indigo
	.property hue:indigo
	.numeric,.number hue:indigo
	.boolean hue:indigo
	.null hue:indigo
	.identifier hue:indigo
	.variable hue:indigo
	.string hue:indigo
	.propname hue:indigo
	.this,.self hue:indigo
	.tag.open,.tag.close hue:indigo
	.variable.scope_root hue:indigo
	.accessor hue:sky
	.operator c:white
	.entity.name
		c:blue4 .field:sky3
	.white
		bdb:white/5

extend tag textarea
	def on$caretmove mods, ctx, handler, o
		log 'on caretmove!'
		let check = do(e)
			let pos = selectionStart
			let end = selectionEnd
			log "checking",e,pos,end
			if (#ss =? pos) or (#se =? end)
				emit('caretmove',{start: pos, end: end})
		for e in ['keypress','click','keyup']
			self.addEventListener(e,check)

		self.addEventListener('caretmove',handler,o)
		return handler

const classCache = {}

extend class Token
	def $view
		<ast-token data=self>

	get #classes
		classCache[type] ||= type.split('.').join(' ')

extend class Node
	def $view
		<ast-group data=self>

extend class Object
	def #view depth = 0
		return if depth > 1
		<div.object> for own k,v of self
			<dl>
				<dt> k
				<dd> <(v..#view(depth + 1))>

extend class Array
	def #view depth = 0
		return if depth > 2
		<div.arr> for val in self
			<(val..#view(depth + 1))>

extend class String
	def #view
		<span.str> this

extend class Number
	def #view
		<span> this

tag ast-node

tag ast-token < ast-node
	css d:inline c:hue4
	
	<self .{data.#classes}
		@click=(state.focus = data) 
		@pointerenter=(state.hover = data)
	> data.value

tag ast-group < ast-node
	css d:inline
		# outline:1px dashed blue5/10
		# outline-offset: 2px
	<self>
		# <(data.start.$view!)>
		for child in data.childNodes
			<(child.$view())>
		# <(data.end..$view!)>
		# if data isa Node
		# 	for child in data.childNodes
		# 		<ASTNode data=child>
		# else
		# 	<span> data.value

tag ast-node-info
	css c:white p:4 cursor:default
		.quoted prefix:'"' suffix: '"'
		dd h:20px pos:relative d:hflex ai:center
		dt h:20px pos:relative d:hflex ai:center
		dl bd:1px solid white/5 d:grid gtc: 100px 1fr p:2
		.multi
			of:hidden h:20px pos:absolute t:0px
			@hover h:auto of:auto pos:absolute t:0px zi:100


	<self>
		if data isa Token
			<div>
				<div> data.type
				<div.quouted> data.value
			<ast-node-info data=data.context>
		elif data isa Node
			# <div> data.type
			# <span.quouted.str> data.value
			<div>
			for parent in [data].concat(data.parents)
				<dl[]>
					<dt> "type"
					<dd> parent.type
					<dt> "path"
					<dd> parent.path
					<dt> "value"
					<dd> <.multi.str[ws:pre]> parent.value # .split("\n").slice(0,10).join("\n").trim()
					<dt> "outerText"
					<dd> <.multi.str[ws:pre]> parent.outerText
					

tag Prop
	<self>
		<label> name
		let v = data or (#context.data[name])
		<div> <(v..#view(0))>

tag ast-context
	<self>
		# let obj{entries,x,y,z} = other
		# <Prop name='before'> data.before.#view(0)
		# <Prop name='after'> data.after.#view(0)
		<Prop name='around'> # data.after.#view(0)
		<Prop name='selfPath'>
		<Prop name='path'>
		#  for own k,v of data
		# 	<tr>
		# 		<td> k
		# 		if v..#view
		# 			<td> <(v..#view(0))>
		# 		else
		# 			<td> String(v)

tag Code
	def hover e
		let tok = e.target.closest('span')
		return unless tok
		log 'hover',tok

	def reselected
		setTimeout(&,20) do
			let sel = window.getSelection!
			let range = sel.getRangeAt(0)
			let off = range.cloneRange!
			off.setStart(document.querySelector('pre code'),0)
			let loc = off.toString!.length
			if state.loc =? loc
				state.context = data.getContextAtOffset(loc)
				state.focus = state.context.token
				imba.commit!

	get code
		innerText

	def save
		window.localStorage.setItem('code',code)

	def pasted e
		log 'pasted',e
		let txt = e.clipboardData.getData('text')
		window.localStorage.setItem('code',txt)
		document.location.reload!
		# log innerText,txt
		# setTimeout(&,100) do save!


	<self contentEditable='true' @keyup=reselected @pointerup=reselected spellcheck=false @paste=pasted>
		# <pre[p:2 m:0 c:blue8]>
		# 	<code innerHTML=highlight(data)>
		<pre[p:6 m:0 c:blue8]>
			<code> <ast-group data=data.root>

tag App	

	def mount
		render!
		$dts.innerText = state.doc.getGeneratedDTS!
		let ol = state.doc.getOutline!.childItems
		console.group 'outline'
		for item in ol
			console.log item
		console.groupEnd!
	def render
		<self[inset:0 fs:12px d:hgrid g:1 bg:black]
			@hotkey('esc')=(state.focus = null)
		>
			css section bg:gray9 pos:relative c:white
			<section[of:auto]>
				<Code data=state.doc>
			<section[d:vflex]>
				css section p:4
				<section>
					if let item = state.focus or state.hover
						<ast-node-info data=item>
					if state.context
						<ast-context data=state.context>
				<section> <pre$dts>
					
	
imba.mount <App>