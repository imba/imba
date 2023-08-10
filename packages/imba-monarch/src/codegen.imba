const splitters = {
	imba: /(### GENERATED:(?:START|END) ###)/g
	sql: /(-- GENERATED:(?:START|END))/g
	js: /(\/\* GENERATED:(?:START|END) \*\/)/g
	ts: /(\/\* GENERATED:(?:START|END) \*\/)/g
}

export default class CodeGen
	name
	stack = []
	braces = no
	out = []
	pre = ''
	sep = '\n'
	prefix = ''
	postfix = ''

	def w ...lines
		for ln in lines
			out.push(pre + ln) if ln != null and ln != false
		self

	def br
		w('')
		self

	def ind wrap,cb
		push(wrap)
		cb()
		pop!
		self

	def push wrap = ''
		# let block = new CodeGen(pre: pre)
		# push(block)
		w(wrap + (braces ? ' {' : '')) if wrap
		# stack.push(wrap[-1] == '{' ? '}' : '')
		pre = pre += '\t'
		return self

	def block start = '', end = '', sep = '\n', fn
		let block = new CodeGen(prefix: start, postfix: end, pre: pre + '\t',sep: sep)
		out.push(block)
		if fn
			fn(block)
		return block

	def curly start = '',fn = null
		block(start + ' {','}','\n',fn)

	def indented fn = null
		block('','','\n',fn)

	def indent start = '', fn = null
		block(start,'','\n',fn)

	def expr start = '',post = '',fn = null
		block(start + '(',')' + post,',\n')

	def object start = '',post = '',fn = null
		block(start + ' {','}',',\n',fn)

	def slot name = ''
		let block = new CodeGen(prefix: name, pre: pre)
		out.push(block)
		return block

	def doc
		w('/**')
		pre += ' * '
		self

	def undoc
		pre = pre.slice(0,-3)
		w('*/')
		self

	def pop wrap = ''
		pre = pre.slice(0,-1)
		w(wrap + (braces ? '}' : '') + '\n')
		self

	def save
		yes

	def end
		pop! while pre.length > 0
		self

	def toString
		if out.length == 0
			return ''

		let str = ''
		if prefix
			str += pre.slice(0,-1) + prefix + '\n'

		let parts = out.filter do ($1 isa CodeGen ? $1.out.length : yes)
		str += parts.join(sep) + '\n'

		if postfix
			str += pre.slice(0,-1) + postfix + '\n'
		str += '\n'

		# TODO remove multiple newlines
		# prefix + out.join('') + postfix
		return str

#	def writeFile path
#		let ext = path.split('.').pop!
#		let curr = try fs.readFileSync(path,'utf8')
#		let out = String(self)
#
#		let regex = splitters[ext]
#		if curr and regex
#			let parts = curr.split(regex)
#			if parts.length > 2
#				parts[2] = '\n' + out + '\n'
#				out = parts.join('')
#				fs.writeFileSync(path,out)
#			else
#				console.log "COULD NOT FIND FILE TO REPLACE IN",path
#		else
#			console.log "File at {path} does not exist"