export const SemanticTokenTypes = [
	'comment'
	'string'
	'keyword'
	'number'
	'regexp'
	'operator'
	'namespace'
	'type'
	'struct'
	'class'
	'interface'
	'enum'
	'typeParameter'
	'function'
	'member'
	'macro'
	'variable'
	'parameter'
	'property'
	'label'
]

for key,index in SemanticTokenTypes
	SemanticTokenTypes[key] = index

export const M = {
	Declaration: 1 << 0
	Import: 1 << 1
	Export: 1 << 2
	Global: 1 << 3
	Local:  1 << 4
	Static: 1 << 5
	Modification: 1 << 6
	Deprecated: 1 << 7
	Access: 1 << 8
	Root: 1 << 9
	Special: 1 << 10
	Class: 1 << 11
	Member: 1 << 12
	Function: 1 << 13
}


export const SemanticTokenModifiers = Object.keys(M).map(do $1.toLowerCase! )

for k in Object.keys(M)
	M[k.toLowerCase!] = M[k]

export const CompletionTypes = {
	Keyword: 1 << 0
	Access: 1 << 1
	Key: 1 << 2
	TagName: 1 << 3
	TagEvent: 1 << 4
	TagFlag: 1 << 5
	TagProp: 1 << 6
	TagEventModifier: 1 << 7
	Value: 1 << 8
	Path: 1 << 9
	StyleProp: 1 << 10
	StyleValue: 1 << 11
}

export const KeywordTypes = {
	Keyword: 1 << 0
	Root: 1 << 1
	Class: 1 << 2
	Block: 1 << 3
}

export const Keywords = {
	and: KeywordTypes.Block
	await: KeywordTypes.Block
	begin: KeywordTypes.Block
	break: KeywordTypes.Block
	by: KeywordTypes.Block
	case: KeywordTypes.Block
	catch: KeywordTypes.Block
	class: KeywordTypes.Block
	const: KeywordTypes.Block
	continue: KeywordTypes.Block
	css: KeywordTypes.Class | KeywordTypes.Root
	debugger: KeywordTypes.Block
	def: KeywordTypes.Class | KeywordTypes.Block
	get: KeywordTypes.Class
	set: KeywordTypes.Class
	delete: KeywordTypes.Block
	do: KeywordTypes.Block
	elif: KeywordTypes.Block
	else: KeywordTypes.Block
	export: KeywordTypes.Root
	extends: KeywordTypes.Block
	false: KeywordTypes.Block
	finally: KeywordTypes.Block
	for: KeywordTypes.Block
	if: KeywordTypes.Block
	import: KeywordTypes.Root
	in: KeywordTypes.Block
	instanceof: KeywordTypes.Block
	is: KeywordTypes.Block
	isa: KeywordTypes.Block
	isnt: KeywordTypes.Block
	let: KeywordTypes.Block
	loop: KeywordTypes.Block
	module: KeywordTypes.Block
	nil: KeywordTypes.Block
	no: KeywordTypes.Block
	not: KeywordTypes.Block
	null: KeywordTypes.Block
	of: KeywordTypes.Block
	or: KeywordTypes.Block
	require: KeywordTypes.Block
	return: KeywordTypes.Block
	self: KeywordTypes.Block
	static: KeywordTypes.Block | KeywordTypes.Class
	super: KeywordTypes.Block
	switch: KeywordTypes.Block
	tag: KeywordTypes.Root
	then: KeywordTypes.Block
	this: KeywordTypes.Block
	throw: KeywordTypes.Block
	true: KeywordTypes.Block
	try: KeywordTypes.Block
	typeof: KeywordTypes.Block
	undefined: KeywordTypes.Block
	unless: KeywordTypes.Block
	until: KeywordTypes.Block
	var: KeywordTypes.Block
	when: KeywordTypes.Block
	while: KeywordTypes.Block
	yes: KeywordTypes.Block
}