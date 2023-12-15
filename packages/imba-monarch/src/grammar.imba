const eolpop = [/^/, token: '@rematch', next: '@pop']
const repop = { token: '@rematch', next: '@pop'}
const toodeep = {token: 'white.indent',next: '@>illegal_indent'}

export const EOF = '§EOF§'

def regexify array, pattern = '#'
	if typeof array == 'string'
		array = array.split(' ')

	let items = array.slice!.sort do $2.length - $1.length
	items = items.map do(item)
		let escaped = item.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
		pattern.replace('#',escaped)
	new RegExp('(?:' + items.join('|') + ')')

def denter indent,outdent,stay,o = {}
	if indent == null
		indent = toodeep

	elif indent == 1
		indent = { next: '@>'}
	elif indent == 2
		indent = {next: '@>_indent&-_indent'}

	elif typeof indent == 'string'
		indent = {next: indent}

	if outdent == -1
		outdent = repop
	if stay == -1
		stay = repop
	elif stay == 0
		o.comment ??= yes

		stay = {}

	indent = Object.assign({token: 'white.tabs'},indent or {})
	stay = Object.assign({token: 'white.tabs'},stay or {})
	outdent = Object.assign({ token: '@rematch', next: '@pop'},outdent or {})

	let cases = {
		'$1==$S2\t': indent
		'$1==$S2': {
			cases: {'$1==$S6': stay,'@default': {token: '@rematch',switchTo: '@*$1'}}
		}
		'@default': outdent
	}
	for k,v of ['next','switchTo']
		if indent[k] and indent[k].indexOf('*') == -1
			indent[k] += '*$1'

	# for own k,v of cases
	let rule = [/^(\t*)(?=[^ \t\n])/,{cases: cases}]
	if o.comment
		let clones = {}
		for own k,v of cases
			let clone = Object.assign({},v)
			if !clone.next and !clone.switchTo
				clone.next = '@>_comment'
			clones[k] = clone
		return [ [/^(\t*)(?=#\s|#$)/,{cases: clones}], rule ]

	return rule

export const states = {

	root: [
		# [/^@comment/,'comment','@>_comment'] # want to push this state _ before the token
		[/^(\t+)(?=[^\t\n])/,{cases: {
			'$1==$S2\t': {token: 'white.indent',next: '@>_indent*$1'}
			'@default': 'white.indent'
		}}]
		'block_'
	]

	_comment: [
		[/^([\t\s\n]*)$/,'comment']
		[/^(\t*)([\S\s]*)/,cases: {
			# same or deeper indentation
			'$1~$S2\t*': {token: 'comment'}
			'@default': {token: '@rematch', next: '@pop'}
		}]
		[/[\S\s]+/,'comment']
	]

	illegal_indent: [
		denter()
	]

	identifier_: [
		[/\$\w+\$/, 'identifier.env']
		[/\$\d+/, 'identifier.special']
		[/\#+@id/, 'identifier.symbol']
		[/\¶@id/, 'ivar'] # imba1
		[/@id\!?/,cases: {
			'this': 'this'
			'self': 'self'
			'@keywords': 'keyword.$#'
			'$0~[A-Z].*': 'identifier.uppercase.$F'
			'@default': 'identifier.$F'
		}]
	]

	block_: [
		# 'common_'
		[/^(\t+)(?=[\r\n]|$)/,'white.tabs']
		'extend_class_'
		'class_'
		'tagclass_'
		'augmentation_'
		'var_'
		'func_'
		'import_'
		'export_'
		'flow_'
		'for_'
		'try_'
		'catch_'
		'while_'
		'css_'
		'tag_'
		'do_'
		'block_comment_'
		'expr_'
		'decorator_'
		[/[ ]+/, 'white']
		'common_'

	]

	indentable_: [
		[/^[ ]+/, 'white']
		denter('@>_paren_indent&-_indent',null,null)
		[/^(\t+)(?=[\r\n]|$)/,'white.tabs']
		'whitespace'
	]

	_indent: [
		denter(2,-1,0)
		'block_'
	]

	_paren_indent: [
		denter(2,-1,0)
		'block_'
		[/\)|\}|\]/,'@rematch', '@pop']
	]

	block: [
		denter('@>',-1,0)
		'block_'
	]
	bool_: [
		[/(true|false|yes|no|undefined|null)(?![\:\-\w\.\_])/,'boolean']
	]

	op_: [
		[/\s+\:\s+/,'operator.ternary']
		# [/\s*(\=)/]
		[/(@unspaced_ops)/,cases: {
			'@spread': 'operator.spread'
			'@access': 'operator.access'
			'@default': 'operator'
		}]
		[/\/(?!\/)/,'operator.math']
		[/\&(?=[,\)])/,'operator.special.blockparam']
		[/(\s*)(@symbols)(\s*)/, cases: {
			'$2@assignments': 'operator.assign'
			'$2@math': 'operator.math'
			'$2@operators': 'operator'
			'$2@logic': 'operator.logic'
			'$2@access': 'operator.access'
			'@default': 'delimiter'
		}]
		[/\&\b/, 'operator']
	]

	keyword_: [
		[/new@B/,'keyword.new']
		[/isa@B/,'keyword.isa']
		[/is@B/,'keyword.is']
		[/(switch|when|throw|continue|break|then|await|typeof|by)@B/,'keyword.$1']
		[/delete@B/,'keyword.delete']
		[/and@B|or@B/, 'operator.flow']
	]

	return_: [
		[/return@B/,'keyword.return']
	]

	yield_: [
		[/yield/,'keyword.yield']
	]

	primitive_: [
		'string_'
		'number_'
		'regexp_'
		'bool_'
	]

	value_: [
		'primitive_'
		'keyword_'
		'implicit_call_'
		'parens_' # call will always capture?
		'key_'
		'access_'
		'identifier_'
		'array_'
		'object_'
	]

	expr_: [
		'comment_'
		'inline_var_'
		'return_'
		'yield_'
		'value_'
		'tag_'
		'op_'
		'type_'
		'spread_'
	]

	attr_expr_: [
		'primitive_'
		'parens_'
		'access_'
		'identifier_'
		'array_'
		'object_'
		'tag_'
		'op_'
	]

	access_: [
		[/(\.\.?)(@propid\!?)/,cases: {
			'$2~[A-Z].*': ['operator.access','accessor.uppercase']
			'$2~#.*': ['operator.access','accessor.symbol']
			'@default': ['operator.access','accessor']
		}]
	]

	call_: [
		[/\(/, '(', '@call_body']
	]

	key_: [
		[/(\#+@id)(\:\s*)/,['key.symbol','operator.assign.key-value']]
		[/(@propid)(\:\s*)/,cases: {
			'@default': ['key','operator.assign.key-value']
		}]
	]

	implicit_call_: [
		[/(\.\.?)(@propid)@implicitCall/,cases: {
			'$2~[A-Z].*': ['operator.access','accessor.uppercase','@implicit_call_body']
			'@default': ['operator.access','accessor','@implicit_call_body']
		}]
		# [/(@constant)@implicitCall/,'identifier.uppercase','@implicit_call_start']
		# [/(@symbol)@implicitCall/,'identifier.uppercase','@implicit_call_start']
		[/(@propid)@implicitCall/,'@rematch','@implicit_call_start']
		// [/(@propid)@implicitCall/,'@rematch','@implicit_call_start']
		# [/(@propid)@implicitCall/,cases: {
		# 	'$1~[A-Z].*': ['identifier.uppercase','@implicit_call_body']
		# 	'@default': ['identifier','@implicit_call_body']
		# }]
	]
	implicit_call_start: [
		'identifier_'
		[/@implicitCall/,'@rematch',switchTo: '@implicit_call_body']
	]

	# [/\$\w+\$/, 'identifier.env']
	# 	[/\$\d+/, 'identifier.special']
	# 	[/\#+@id/, 'identifier.symbol']
	# 	[/\¶@id/, 'ivar'] # imba1
	# 	[/@id\!?/,cases: {
	# 		'this': 'this'
	# 		'self': 'self'
	# 		'@keywords': 'keyword.$#'
	# 		'$0~[A-Z].*': 'identifier.uppercase.$F'
	# 		'@default': 'identifier.$F'
	# 	}]

	implicit_call_body: [
		eolpop
		[/\)|\}|\]|\>/,'@rematch', '@pop']
		'arglist_'
		'whitespace'
	]

	arglist_: [
		'do_'
		'expr_'
		[/\s*\,\s*/,'delimiter.comma']
	]

	params_: [
		[/\[/, 'array.[', '@array_var_body=decl-param']
		[/\{/, 'object.{', '@object_body=decl-param']
		[/(@variable)/,'identifier.decl-param']
		# [/(\s*\=\s*)(?=(for|while|until|if|unless)\s)/,'operator','@pop']
		'spread_'
		'type_'
		[/\s*\=\s*/,'operator','@var_value=']
		[/\s*\,\s*/,'separator']
		[/\s/,'white.params']
	]

	object_: [
		[/\{/, 'object.{', '@object_body']
	]

	parens_: [
		[/\(/, 'parens.(', '@parens_body']
	]

	parens_body: [
		[/\)/, ')', '@pop']
		'indentable_'
		'arglist_'
	]

	array_: [
		[/\[/, 'array.[', '@array_body']
	]

	array_body: [
		[/\]@implicitCall/, token: ']', switchTo: '@implicit_call_body=']
		[/\]/, ']', '@pop']
		[/\)|\}/,'invalid']
		'indentable_'
		'expr_'
		[',','delimiter']
	]

	object_body: [
		[/\}/, '}', '@pop']
		[/(@id)(\s*:\s*)/, ['key','operator.assign.key-value','@object_value']]
		[/(@id)/, 'identifier.$F']
		[/\[/, '[', '@object_dynamic_key='] #
		[/\s*=\s*/,'operator.assign','@object_value=']
		[/:/,'operator.assign.key-value','@object_value=']
		[/\,/,'delimiter.comma']
		'indentable_'
		'expr_'
	]

	object_value: [
		eolpop
		# couldnt this be indented as well?
		# [/(?=,|\})/, 'delimiter', '@pop']
		[/,|\}|\]|\)/, '@rematch', '@pop']
		'expr_'
	]

	object_dynamic_key: [
		[']',']','@pop']
		'expr_'
	]

	comment_: [
		[/#(\s.*)?(?=\n)/, 'comment']
		# [/#(\s.*)?(\n|$)/, 'comment']
	]

	block_comment_: [
		[/###/, 'comment.start','@_block_comment']
	]

	_block_comment: [
		[/###/,'comment.end','@pop']
		[/[^#]+/,'comment']
		[/#(?!##)/,'comment']
	]

	# add try_start that accepts catch on the same line?
	try_: [
		[/try@B/,'keyword.try','@>_try&try']
	]

	catch_: [
		[/(catch\s+)(?=@id(\s|$))/, 'keyword.catch','@catch_start&catch']
		[/catch@B/,'keyword.catch','@catch_start&catch']
	]

	catch_start: [
		[/@id/,'identifier.decl-const',switchTo:'@>_catch']
		[/.?/,'@rematch',switchTo:'@>_catch']
	]

	_catch: [
		denter('@>block',-1,0)
		'block_'
	]

	_try: [
		denter('@>block',-1,0)
		'block_'
	]

	do_: [
		# [/(do)(\()/,['keyword.do','(','@>_do_params&do']]
		[/do(?=\()/,'keyword.do','@>do_start&do']
		[/do(?=\s*\|)/,'keyword.do','@>do_piped&do']
		[/do@B/,'keyword.do','@>_do&do']
	]

	do_start: [
		denter(null,-1,-1)
		[/\(/,'(',switchTo: '@_do_params']
		[/./,'@rematch',switchTo:'@_do']
	]

	do_piped: [
		denter(null,-1,-1)
		[/\s*\|/,'args.open',switchTo: '@_do_piped_params']
		[/./,'@rematch',switchTo:'@_do']
	]

	_do_piped_params: [
		[/\|/,'args.close',switchTo: '@_do']
		'params_'
	]

	_do_params: [
		[/\)/,')',switchTo: '@_do']
		'params_'
	]

	_do: [
		denter(2,-1,0)
		# block in general, no?
		[/(\}|\)|\])/,'@rematch', '@pop']
		'block_'
	]

	class_: [
		[/(extend)(?=\s+(global )?(class|interface|mixin) )/,'keyword.$1']
		[/(global)(?=\s+(class|interface|mixin|abstract) )/,'keyword.$1']
		[/(abstract)(?=\s+(class|interface) )/,'keyword.$1']
		# [/(class)(\s)(@id)(\.)(@id)/, ['keyword.$1','white.$1name','entity.name.namespace','punctuation.accessor', 'entity.name.class','@class_start=']]
		[/(class|interface|mixin)(\s)(?=@id\.@id)/, ['keyword.$1','white.$1name','@classname_start/$3']]

		[/(class|interface|mixin)(\s)(@classid)/, ['keyword.$1','white.$1name','entity.name.class.decl-const','@class_start=']]
		[/(class|interface|mixin)(?=\n)/, 'keyword.$1','@>_class&class=']
	]

	classname_start: [
		[/\w/,'@rematch','@assignable&-assignable']
		[/(\s+\<\s+)/,['keyword.extends.$/','@assignable&-value']]
		[/@comment/,'comment']
		[/\n/,'@rematch',switchTo: '@>_class&class=']
		# [/^/,'@rematch',switchTo: '@>_class&class=']
		'whitespace'
	]

	assignable: [
		'identifier_'
		'access_'
		[/\s+|\n/,'@rematch','@pop']
	]
	
	# Is this not covered by class_?
	extend_class_: [
		[/(extend)(\s)(class|interface|mixin)(\s)/,
			['keyword.$1','white.$1','keyword.$3','white.extendclass','@classname_start/$3']
		]
	]

	augmentation_: [
		[/(extend)(?=\s+@id)/,'keyword.$1','@augmentation_start=']
	]

	augmentation_start: [
		denter({switchTo: '@>_class&class='},-1,-1)
		# denter({switchTo: '@>_flow&-body'},-1,-1)
		# denter('@>_flow&block',-1,-1)
		[/[ \t]+/, 'white']
		'expr_'
	]

	class_start: [
		[/(\s+\<\s+)(@id)/,['keyword.extends','identifier.superclass']]
		[/@comment/,'comment']
		[/^/,'@rematch',switchTo: '@>_class&class=']
		'whitespace'
	]

	tagclass_: [
		[/(extend)(?=\s+tag )/,'keyword.$1']
		[/(global)(?=\s+tag )/,'keyword.$1']
		[/(tag)(\s)(@constant)/, ['keyword.tag','white.tagname','entity.name.component.local','@tagclass_start=']] # only when uppercase
		[/(tag)(\s)(@id)/, ['keyword.tag','white.tagname','entity.name.component.global','@tagclass_start=']] # only when uppercase
	]

	tagclass_start: [
		[/(\s+\<\s+)(@id)/,['keyword.extends','identifier.superclass']]
		[/@comment/, 'comment']
		[/^/,'@rematch',switchTo: '@>_tagclass&component=']
	]

	import_: [
		[/(import)(?=\s+['"])/,'keyword.import','@>import_source']
		[/(import)(\s+type)(?=\s[\w\$\@\{])/,['keyword.import','keyword.type','@>import_body&-_imports=decl-import-type/part']]
		[/(import)@B/,'keyword.import','@>import_body&-_imports=decl-import/part']
	]

	import_body: [
		denter(null,-1,0)
		[/(@esmIdentifier)( +from)/,['identifier.$F.default','keyword.from',switchTo: '@import_source']]
		[/(\*)(\s+as\s+)(@esmIdentifier)(\s+from)/,['keyword.star','keyword.as','identifier.$F.ns','keyword.from',switchTo: '@import_source']]
		[/(@esmIdentifier)(\s*,\s*)(\*)(\s+as\s+)(@esmIdentifier)(from)/,
			['identifier.$F.default','delimiter.comma','keyword.star','keyword.as','identifier.$F.ns','keyword.from',switchTo: '@import_source']]
		# [/(\*)(\s+as\s+)(@esmIdentifier)/, ['keyword.star','keyword.as','identifier.const.import',switchTo: '@/delim']]
		# [/(@esmIdentifier)(\s+as\s+)(@esmIdentifier)/, ['alias','keyword.as','identifier.const.import']]
		[/\ *from/, 'keyword.from',switchTo: '@import_source']
		[/\{/,'specifiers.{','@esm_specifiers/part']
		[/(@esmIdentifier)/,'identifier.$F',switchTo: '@/delim']
		[/\s*\,\s*/,'delimiter.comma',switchTo: '@/part']
		'comma_'
		'common_'
	]

	import_source: [
		denter(null,-1,0)
		[/["']/, 'path.open','@_path=$#']
		eolpop
	]

	export_: [
		[/(export)( +)(default)@B/,['keyword.export','white','keyword.default']] # ,'@>import_body'
		[/(export)( +)(abstract)@B/,['keyword.export','white','keyword.abstract']] # ,'@>import_body'
		[/(export)(?= +(let|const|var|class|tag|interface)@B)/,'keyword.export'] # ,'@>import_body'
		[/(export)( +)(global)@B/,['keyword.export','white','keyword.global']] # ,'@>import_body'

		[/(export)(\s+\*\s+)(from)@B/,['keyword.export','operator.star','keyword.from','@>import_source']]
		[/(export)@B/,'keyword.export','@>export_body']
	]

	export_body: [
		denter(null,-1,0)
		[/(\*)(\s+as\s+)(@esmIdentifier)/, ['keyword.star','keyword.as','identifier.const.export']]
		[/(@esmIdentifier)(\s+as\s+)(default)/, ['alias','keyword.as','alias.default']]
		[/(@esmIdentifier)(\s+as\s+)(@esmIdentifier)/, ['alias','keyword.as','identifier.const.export']]
		[/from/, 'keyword.from',switchTo: '@import_source']
		[/\{/,'{','@esm_specifiers=export/part']
		[/(@esmIdentifier)/,'identifier.const.export']
		[/\*/,'operator.star']
		'comma_'
		'common_'
	]

	esm_specifiers: [
		[/\}/, '}', '@pop']
		[/(@esmIdentifier)(\s+as\s+)(@esmIdentifier)/, ['alias','keyword.as','identifier.const.$F',switchTo: '@/delim']]
		[/@esmIdentifier/,cases: {
			'$/==part': {token: 'identifier.const.$S4', switchTo: '@/delim'}
			'@default': {token: 'invalid'}
		}]
		[/\s*\,\s*/,'delimiter.comma',switchTo: '@/part']
		'whitespace'
	]

	_path: [
		[/[^"'\`\{\\]+/, 'path']
		[/@escapes/, 'path.escape']
		[/\./, 'path.escape.invalid']
		[/\{/, 'invalid']
		[/["'`]/, cases: { '$#==$F': { token: 'path.close', next: '@pop' }, '@default': 'path' }]
	]

	member_: [
		# [/static(?=\s+(get|set|def) )/,'keyword.static'] # only in class and tagclass?
		[/(constructor)@B/, 'entity.name.constructor','@>def_params&def/def=decl-param']
		[/(protected|private)(\s)(?=def|get|set)/, ['keyword.$1','white.entity']]
		[/(def|get|set)(\s)(@defid)/, ['keyword.$1','white.entity','entity.name.$1','@>def_params&$1/$1=decl-param']]
		[/(def|get|set)(\s)(\[)/, ['keyword.$1','white.entity','$$','@>def_dynamic_name/$1']]
	]

	func_: [
		[/export(?=\s+(get|set|def|global) )/,'keyword.export'] # only in class and tagclass?
		[/global(?=\s+(get|set|def) )/,'keyword.global'] # only in class and tagclass?
		[/(def)(\s)(@id)(\.)(@defid)/,[
			'keyword.$1','white.entity','identifier.target','operator','entity.name.def', '@>def_params&$1/$1'
		]]

		[/(def)(\s)(@defid)/, ['keyword.$1','white.entity','entity.name.function.decl-const-func','@>def_params&$1/$1']]
	]

	flow_: [
		# [/(else)(?=\s|$)/, ['keyword.$1','@flow_start.$S2.flow.$S4']]
		[/(else)(?=\s|$)/, ['keyword.$1','@>_flow&$1']]
		[/(if|else|elif|unless)(?=\s|$)/, ['keyword.$1','@flow_start=$1']]
	]

	flow_start: [
		denter({switchTo: '@>_flow&$F'},-1,-1)
		# denter({switchTo: '@>_flow&-body'},-1,-1)
		# denter('@>_flow&block',-1,-1)
		[/[ \t]+/, 'white']
		'expr_'
	]

	for_: [
		[/for(?: own| await)?@B/,'keyword.$#','@for_start&forscope=decl-for']
		# [/for@B/,'keyword.$#','@for_start&flow=let']
	]

	while_: [
		[/(while|until)@B/,'keyword.$#','@>while_body']
	]
	while_body: [
		denter(2,-1,0)
		'block_'
	]

	for_start: [
		denter({switchTo: '@>for_body'},-1,-1)
		[/\[/, 'array.[', '@array_var_body']
		[/\{/, 'object.{', '@object_body'] # object_var_body?
		[/(@variable)/,'identifier.$F']
		[/(\s*\,\s*)/,'separator','@=decl-for-index']
		[/\s(in|of)@B/,'keyword.$1',switchTo: '@>for_source=']
		[/[ \t]+/, 'white']
		'type_'
	]
	for_source: [
		denter({switchTo: '@>for_body'},-1,{switchTo: '@for_body'})
		'expr_'
		[/[ \t]+/, 'white']
	]

	for_body: [
		denter(2,-1,0)
		'block_'
	]

	decorator_: [
		# [/(@decid)(\()/,['decorator','$2','@_decorator_params']]
		# [/(@decid)/,'decorator']
		[/(?=@decid)/,'','@_decorator&-_decorator']
	]

	_decorator: [
		[/(@decid)/,'decorator.name']
		[/(\.)(\!?@optid)/,['decorator.modifier.start','decorator.modifier.name']]
		[/\(/,token: 'decorator.parens.open', next: '@_decorator_parens/0']
		[/\[/,token: 'decorator.brackets.open', next: '@_decorator_brackets/0']
		[/\{/,token: 'decorator.braces.open', next: '@_decorator_braces/0']
		[/(\s*\=\s*)/,'operator.equals.decorator/', '@_tag_value&handler']
		[/\s+/,'@rematch','@pop']
	]

	_decorator_parens: [
		[/\)/,'decorator.$/.parens.close', '@pop']
		'arglist_'
		[/\]|\}/,'invalid']
	]

	_decorator_params: [
		[/\)/,')','@pop']
		'expr_'
		[/\s*\,\s*/,'delimiter.comma']
	]
	_decorator_brackets: [
		[/\]/,']','@pop']
		'expr_'
		[/\s*\,\s*/,'delimiter.comma']
	]
	_decorator_braces: [
		[/\}/,'}','@pop']
		'expr_'
		[/\s*\,\s*/,'delimiter.comma']
	]

	field_: [
		[/((?:lazy )?)((?:static )?)(const|let|attr|prop|isa)(?=\s|$)/, ['keyword.lazy','keyword.static','keyword.$1','@_vardecl=field-$3']] # $2_body.$S2.$2.$S4
		[/(declare\s+)(?=@fieldid)/,'keyword.declare']
		[/(static\s+)(?=@fieldid)/,'keyword.static']
		[/(@fieldid)(?=$)/,'entity.name.field']
		[/(@fieldid)/,['entity.name.field','@_field_1']]
	]

	_field_1: [
		denter(null,-1,-1)
		'type_'
		[/(\s*=)(?!\=)/,['operator.assign','@_field_value&field']]
		[/(\s*(?:\@)set\s*)/,['keyword.spy','@>_def&spy']]
		[/(\s*as)(?=\s)/,['keyword.accessor','@>_def&field']]
		[/(?=\s\@|$)/,'','@>_def&field']
		# [/(\s*\@)(?=\s)/,['keyword.accessor','@>_def&field']]
	]

	_field_value: [
		denter(2,-1,-1)
		'block_' # sure?
		[/(\s*(?:\@)set\s*)/,['@rematch','@pop']]
	]

	var_: [
		[/(const|let)(?=\s[\[\{\$a-zA-Z]|\s*$)/, ['keyword.$1','@_vardecl=decl-$1']] # $2_body.$S2.$2.$S4
		[/(const|let)(?=\s|$)/, ['keyword.$1']]
	]

	inline_var_: [
		[/(const|let)(?=\s[\[\{\$a-zA-Z]|\s*$)/, ['keyword.$1','@inline_var_body=decl-$1']]
	]

	string_: [
		[/"""/, 'string', '@_herestring="""']
		[/'''/, 'string', '@_herestring=\'\'\'']
		[/["'`]/, 'string.open','@_string=$#']
	]

	number_: [
		[/0[xX][0-9a-fA-F_]+/, 'number.hex']
		[/0[b][01_]+/, 'number.binary']
		[/0[o][0-9_]+/, 'number.octal']
		[/(\d+)([a-z]+|\%)/, ['number','unit']]
		[/(\d*\.\d+(?:[eE][\-+]?\d+)?)([a-z]+|\%)/, ['number.float','unit']]
		[/\d+[eE]([\-+]?\d+)?/, 'number.float']
		[/\d[\d_]*\.\d[\d_]*([eE][\-+]?\d+)?/, 'number.float']
		[/\d[\d_]*/, 'number.integer']
		[/0[0-7]+(?!\d)/, 'number.octal']
		[/\d+/, 'number']
	]

	_string: [
		[/[^"'\`\{\\]+/, 'string']
		[/@escapes/, 'string.escape']
		[/\./, 'string.escape.invalid']
		[/\{/, cases: {
			'$F==\'': 'string'
			'@default': { token: 'string.bracket.open', next: '@interpolation_body' }
		}]
		[/["'`]/, cases: { '$#==$F': { token: 'string.close', next: '@pop' }, '@default': 'string' }]
		[/#/, 'string']
	]

	_herestring: [
		[/("""|''')/, { cases: { '$1==$F': { token: 'string', next: '@pop' }, '@default': 'string' } }],
		[/[^#\\'"\{]+/, 'string'],
		[/['"]+/, 'string'],
		[/@escapes/, 'string.escape'],
		[/\./, 'string.escape.invalid'],
		[/\{/, { cases: { '$F=="""': { token: 'string', next: '@interpolation_body' }, '@default': 'string' } }],
		[/#/, 'string']
	]

	interpolation_body: [
		[/\}/,'string.bracket.close','@pop']
		'expr_'
	]

	_class: [
		denter(toodeep,-1,0)
		# 'var_'
		'css_'
		'member_'
		'comment_'
		'block_comment_'
		'decorator_'
		[/(get|set|def|static|prop|attr)@B/,'keyword.$0']
		'field_'
		'common_'
	]

	_tagclass: [
		'_class'
		[/(?=\<self)/,'entity.name.def.render','@_render&def',]
		# self def
	]

	def_params: [
		# denter({switchTo: '@>_def'},-1,{switchTo: '@>_def'})
		[/\(/,'(','@def_parens']
		[/^/,'@rematch',switchTo:'@_def=']
		[/do@B/,'keyword.do',switchTo:'@_def=']
		'params_'
		[/@comment/,'comment']
	]

	def_parens: [
		[/\)/,')','@pop']
		'params_'
	]

	def_dynamic_name: [
		[']',token: 'square.close',switchTo: '@def_params&$/=decl-param']
		'expr_'
	]

	_render: [
		denter(2,-1,-1)
		'block_'
	]

	_def: [
		denter(2,-1,0)
		'block_'
	]

	_flow: [
		denter(2,-1,0)
		'block_'
	]

	_varblock: [
		denter(1,-1,-1)
		[/\[/, 'array.[', '@array_var_body']
		[/\{/, 'object.{', '@object_body']
		[/(@variable)/,'identifier.$F']
		[/\s*\,\s*/,'separator']
		[/(\s*\=\s*)(?=(for|while|until|if|unless|try)\s)/,'operator','@pop']
		[/(\s*\=\s*)/,'operator','@var_value=']
		'type_'
		[/#(\s.*)?\n?$/, 'comment']
	]

	_vardecl: [
		denter(null,-1,-1)
		[/\[/, 'array.[', '@array_var_body']
		[/\{/, 'object.{', '@object_body']
		[/(@variable)(?=\n|,|$)/,'identifier.$F','@pop']
		[/(@variable)/,'identifier.$F']
		[/(\s*\=\s*)/,'operator.declval',switchTo: '@var_value&value='] # ,switchTo: '@var_value='
		'type_'
		'whitespace'
	]

	array_var_body: [
		[/\]/, ']', '@pop']
		[/\{/, 'object.{', '@object_body']
		[/\[/, 'array.[', '@array_var_body']
		'spread_'
		[/(@variable)/,'identifier.$F']
		[/(\s*\=\s*)/,'operator.assign','@array_var_body_value=']
		# 'expr_'
		[',','delimiter']
	]

	array_var_body_value: [
		[/(?=,|\)|]|})/, 'delimiter', '@pop']
		'expr_'
	]

	inline_var_body: [
		[/\[/, 'array.[', '@array_var_body']
		[/\{/, 'object.{', '@object_body']
		[/(@variable)/,'identifier.$F']
		[/(\s*\=\s*)/,'operator','@pop'] # ,switchTo: '@var_value='
		'type_'
	]

	var_value: [
		[/(?=,|\)|]|})/, 'delimiter', '@pop']
		denter({switchTo: '@>block'},-1,-1)
		'block_'
		# 'do_'
		# 'expr_'
		# 'common_'
	]

	common_: [
		[/^(\t+)(?=\n|$)/,'white.tabs']
		'whitespace'
	]
	comma_: [
		[/\s*,\s*/,'delimiter.comma']
	]

	spread_: [
		[/\.\.\./,'operator.spread']
	]

	type_: [
		[/\\(?!\/)/, '@rematch','@_type&-_type/0']
	]

	_type: [
		denter(-1,-1,-1)
		[/\\/,'delimiter.type.prefix']
		# these should probably stack and pair
		[/\[/,'delimiter.type','@/]']
		[/\(/,'delimiter.type','@/)']
		[/\{/,'delimiter.type','@/}']
		[/\</,'delimiter.type','@/>']
		[/\|/,'delimiter.type.union']
		[/\,|\s|\=|\./,{
			cases: {
				'$/==0': { token: '@rematch', next: '@pop' }
				'@default': 'type'
			}
		}]
		[/[\]\}\)\>]/,{
			cases: {
				'$#==$/': { token: 'delimiter.type', next: '@pop' }
				'@default': { token: '@rematch', next: '@pop' }
			}
		}]
		[/[\w\-\$]+/,'type']
	]

	css_: [
		[/global(?=\s+css@B)/,'keyword.$#']
		[/css(?=\s+|$)/, 'keyword.css','@>css_selector&rule-_sel']
		# [/(\%\w+)/,'@rematch','@>css_selector&rule-_sel']
		# [/(\%)(?=\w+)/,'keyword.css','@>css_selector&rule-_sel']
		[/(\%)([\w\-]+)/,['style.selector.mixin.prefix','style.selector.mixin.name','@>css_selector&rule-_sel']]

	]

	sel_: [
		[/(\%)((?:@id)?)/,['style.selector.mixin.prefix','style.selector.mixin.name']]
		[/(\@)(\.{0,2}[\w\-\<\>\!]*\+?)/,'style.selector.modifier']
		[/(\@)(\.{0,2}[\w\-\<\>\!]*)/,'style.selector.modifier']
		[/\.([\w\-]+)?/,'style.selector.class-name']
		[/\#([\w\-]+)?/,'style.selector.id']
		[/([\w\-]+)/,'style.selector.element']
		[/(>+|~|\+)/,'style.selector.operator']
		[/(\*+)/,'style.selector.element.any']
		[/(\$)((?:@id)?)/,['style.selector.reference.prefix','style.selector.reference']]
		[/\&/,'style.selector.context']
		[/\(/,'delimiter.selector.parens.open','@css_selector_parens']
		[/\[/,'delimiter.selector.attr.open','@css_selector_attr']
		[/\s+/,'white']
		[/,/,'style.selector.delimiter']
		[/#(\s.*)?\n?$/, 'comment']
	]

	css_props: [
		denter(null,-1,0)
		[/(?=@cssPropertyKey)/,'','@css_property&-_styleprop-_stylepropkey']
		[/#(\s.*)?\n?$/, 'comment']
		[/(?=[\%\*\w\&\$\>\.\[\@\!]|\#[\w\-])/,'','@>css_selector&rule-_sel']
		[/\s+/, 'white']
	]

	css_selector: [
		denter({switchTo: '@css_props&_props'},-1,{token:'@rematch',switchTo:'@css_props&_props'})
		[/(\}|\)|\])/,'@rematch', '@pop']
		[/(?=\s*@cssPropertyKey)/,'',switchTo:'@css_props&_props']
		[/\s*#\s/,'@rematch',switchTo:'@css_props&_props']
		'sel_'
	]

	css_inline: [
		[/\]/,'style.close','@pop']
		[/(?=@cssPropertyKey)/,'','@css_property&-_styleprop-_stylepropkey']
		[/(?=@cssPropertyPath\])/,'','@css_property&-_styleprop-_stylepropkey']
	]

	css_selector_parens: [
		[/\)/, 'delimiter.selector.parens.close','@pop']
		'sel_'
	]

	css_selector_attr: [
		[/\]/, 'delimiter.selector.parens.close','@pop']
		'sel_'
	]

	css_property: [
		denter(null,-1,-1)
		[/\]/,'@rematch','@pop']
		[/(\d+)(@id)/, ['style.property.unit.number','style.property.unit.name']]
		[/((--|\$)@id)/, 'style.property.var']
		[/(-*@id)/, 'style.property.name']
		# [/(\@+)([\>\<\!]?[\w\-]+)/, ['style.property.modifier.start','style.property.modifier']]
		# [/[\^]+/,'style.property.modifier']
		[/(\^+)(@cssModifier)/,['style.property.modifier.up','style.property.modifier']]
		[/@cssModifier/,'style.property.modifier']
		[/(\.+)(@id\-?)/, ['style.property.modifier.start','style.property.modifier']]
		[/\+(@id)/, 'style.property.scope']
		[/\s*([\:\=]\s*)(?=@br|$)/, 'style.property.operator',switchTo: '@>css_multiline_value&_stylevalue']
		[/\s*([\:\=]\s*)/, 'style.property.operator',switchTo: '@>css_value&_stylevalue']
	]

	css_value_: [
		[/(x?xs|sm\-?|md\-?|lg\-?|xx*l|\dxl|hg|x+h)\b/, 'style.value.size'],
		[/\#[0-9a-fA-F]+/, 'style.value.color.hex'],
		[/((--|\$)@id)/, 'style.value.var']
		[/(@optid)(\@+|\.+)(@optid)/,['style.property.name','style.property.modifier.prefix','style.property.modifier']]
		'op_'
		'string_'
		[/(\d+)([a-z]+|\%)/, ['style.value.number','style.value.unit']]
		[/(\d*\.\d+(?:[eE][\-+]?\d+)?)([a-z]+|\%)/, ['style.value.number.float','style.value.unit']]
		[/\d[\d_]*\.\d[\d_]*([eE][\-+]?\d+)?/, 'style.value.number.float']
		[/\d[\d_]*/, 'style.value.number.integer']
		[/0[0-7]+(?!\d)/, 'style.value.number.octal']
		[/\d+/, 'style.value.number']
		'number_'
		'comment_'
		[/\s+/,'style.value.white']
		[/\(/, 'delimiter.style.parens.open', '@css_expressions']
		[/\{/, 'delimiter.style.curly.open', '@css_interpolation&-_styleinterpolation']
		[/(@id)/, 'style.value']
	]

	css_value: [
		denter({switchTo: '@>css_multiline_value'},-1,-1)
		# [/@cssModifier/, '@rematch', '@pop']
		[/@cssPropertyKey/, '@rematch', '@pop']
		[/;/, 'style.delimiter', '@pop']
		[/(\}|\)|\])/, '@rematch', '@pop']
		'css_value_'
	]

	css_multiline_value: [
		denter(null,-1,0)
		[/@cssPropertyKey/, 'invalid']
		'css_value_'
	]

	css_expressions: [
		[/\)/, 'delimiter.style.parens.close', '@pop']
		[/\(/, 'delimiter.style.parens.open', '@css_expressions']
		'css_value'
	]

	css_interpolation: [
		[/\}/, 'delimiter.style.curly.close', '@pop']
		'expr_'
	]

	expressions: [
		[/\,/, 'delimiter.comma']
	]

	whitespace: [
		[/[\r\n]+/, 'br']
		[/[ \t\r\n]+/, 'white']
	]

	space: [
		[/[ \t]+/, 'white']
	]

	tag_: [
		[/(\s*)(<)(?=\.)/,['white','tag.open','@_tag/flag']],
		[/(\s*)(<)(\w[\-\w]*)(?=\()/,['white','tag.open','identifier.tag.name','@_tag/name']]
		[/(\s*)(<)(?=\w|\{|\[|\%|\#|\(|>)/,['white','tag.open','@_tag/name']]
	]
	tag_content: [
		denter(2,-1,0)
		[/\)|\}|\]/,'@rematch', '@pop']
		'common_'
		'flow_'
		'var_'
		'for_'
		'css_'
		'expr_'
		'do_'
		# dont support object keys directly here
	]

	tag_children: [

	]

	_tag: [
		[/\/>/,'tag.close','@pop']
		[/>/,'tag.close',switchTo: '@>tag_content=&-_tagcontent']
		# '@>css_selector&rule-_sel'
		[/>/,'tag.close','@pop']
		[/(\-?\d+)/,'tag.$S3']
		[/(\%)(@id)/,['tag.mixin.prefix','tag.mixin.name']]
		[/\#@id/,'tag.id']

		[/\./,{ cases: {
			'$/==event': {token: 'tag.event-modifier.start', switchTo: '@/event-modifier'}
			'$/==event-modifier': {token: 'tag.event-modifier.start', switchTo: '@/event-modifier'}
			'$/==modifier': {token: 'tag.modifier.start', switchTo: '@/modifier'}
			'$/==rule': {token: 'tag.rule-modifier.start', switchTo: '@/rule-modifier'}
			'$/==rule-modifier': {token: 'tag.rule-modifier.start', switchTo: '@/rule-modifier'}
			'@default': {token: 'tag.flag.start', switchTo: '@/flag'}
		}}]

		[/(\$@id)/,{ cases: {
			'$/==name': 'tag.reference'
			'$/==attr': {token: '@rematch', next: '@_tag_attr&-_tagattr'}
			'@default': 'tag.$/'
		}}]

		[/\{/,'tag.$/.interpolation.open', '@_tag_interpolation']
		[/\[/,'style.open', '@css_inline']
		[/(\s*\=\s*)/,'operator.equals.tagop.tag-$/', '@_tag_value&-value']
		[/\:/,token: 'tag.event.start', switchTo: '@/event']
		'tag_event_'
		# 'tag_attr_'
		[/(\-?@tagIdentifier)(\:@id)?/,{ cases: {
			'$/==attr': {token: '@rematch', next: '@_tag_attr&-_tagattr'}
			'@default': {token: 'tag.$/'}
		}}]
		# [/\@/,token: 'tag.event.start', switchTo: '@/event']
		# [/\{/,token: 'tag.$/.braces.open', next: '@_tag_interpolation/0']
		[/\(/,token: 'tag.$/.parens.open', next: '@_tag_parens/0']
		[/\s+/,token: 'tag.white', switchTo: '@/attr']
		'comment_'
	]
	tag_event_: [
		# add an additional slot for name etc?
		# [/(\@)(@optid)/,['tag.event.start','tag.event.name','@_tag_event&_tagevent/$2']]
		[/(?=\@@optid)/,'','@_tag_event&-_listener']
	]

	_tag_part: [
		[/\)|\}|\]|\>/,'@rematch', '@pop']
	]
	_tag_event: [
		'_tag_part'
		[/(\@)(@optid)/,['tag.event.start','tag.event.name']]
		[/(\.)(\!?@optid)/,['tag.event-modifier.start','tag.event-modifier.name']]
		[/\(/,token: 'tag.$/.parens.open', next: '@_tag_parens/0']
		[/(\s*\=\s*)/,'operator.equals.tagop.tag-$/', '@_tag_value&handler']
		[/\s+/,'@rematch','@pop']
	]

	tag_attr_: [
		# add an additional slot for name etc?
		# [/(\@)(@optid)/,['tag.event.start','tag.event.name','@_tag_event&_tagevent/$2']]
		[/(?=@tagIdentifier(\:@id)?)/,'','@_tag_attr&-_attribute']
	]

	_tag_attr: [
		'_tag_part'
		[/(\-?@tagIdentifier)(\:@id)?/,'tag.attr']
		[/\.(@optid)/,'tag.event-modifierzz']
		[/\(/,token: 'tag.parens.open.$/', next: '@_tag_parens/0']
		[/(\s*\=\s*)/,'operator.equals.tagop.tag-$/', '@_tag_value&-tagattrvalue']
		[/\s+/,'@rematch','@pop']
	]

	_tag_interpolation: [
		[/\}/,'tag.$/.interpolation.close','@pop']
		'expr_'
		[/\)|\]/,'invalid']
	]

	_tag_parens: [
		[/\)/,'tag.$/.parens.close', '@pop']
		'arglist_'
		[/\]|\}/,'invalid']
	]

	_tag_value: [
		[/(?=(\/?\>|\s))/,'','@pop']
		'attr_expr_'
	]

	regexp_: [
		[/\/(?!\ )(?=([^\\\/]|\\.)+\/)/, { token: 'regexp.slash.open', bracket: '@open', next: '@_regexp'}]
		[/\/\/\//, { token: 'regexp.slash.open', bracket: '@open', next: '@_hereregexp'}]
		[/(\/)(\/)/, ['regexp.slash.open','regexp.slash.close']]
		# [/(\/)([^\\\/]|\\.)*(\\\/)(?=($))/, token: 'regexp']
	]

	_regexp: [
		[/(\{)(\d+(?:,\d*)?)(\})/, ['regexp.escape.control', 'regexp.escape.control', 'regexp.escape.control'] ],
		[/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/, ['regexp.escape.control',{ token: 'regexp.escape.control', next: '@_regexrange'}]],
		[/(\()(\?:|\?=|\?!)/, ['regexp.escape.control','regexp.escape.control'] ],
		[/[()]/,        'regexp.escape.control'],
		[/@regexpctl/,  'regexp.escape.control'],
		[/[^\\\/]/,     'regexp' ],
		[/@regexpesc/,  'regexp.escape' ],
		[/\\:/,     'regexp.escape' ],
		[/\\\./,        'regexp.invalid' ],
		[/(\/)(\w+)/, [{ token: 'regexp.slash.close'},{token: 'regexp.flags', next: '@pop'}] ],
		['/', { token: 'regexp.slash.close', next: '@pop'}],
		[/./,        'regexp.invalid' ],
	]

	_regexrange: [
		[/-/,     'regexp.escape.control']
		[/\^/,    'regexp.invalid']
		[/@regexpesc/, 'regexp.escape']
		[/[^\]]/, 'regexp']
		[/\]/,    'regexp.escape.control', '@pop']
	]

	_hereregexp: [
		[/[^\\\/#]/, 'regexp']
		[/\\./, 'regexp']
		[/#.*$/, 'comment']
		['///[igm]*','regexp', '@pop' ]
		[/\//, 'regexp']
		'comment_'
	]
}

# states are structured:
# 1 = the monarch state
# 2 = the current indentation (I)
# 3 = the current scope name/type (&)
# 4 = various flags (F)
# 5 = the monarch substate -- for identifiers++
###
The monarch substate can be state using /something

###
def rewrite-state raw

	let state = ['$S1','$S2','$S3','$S4','$S5','$S6']

	if raw.match(/\@(pop|push|popall)/)
		return raw

	raw = raw.slice(1) if raw[0] == '@'

	if raw.indexOf('.') >= 0
		return raw

	raw = rewrite-token(raw)
	# if raw.match(/^[\w\$\.\-]+$/)
	#	return raw

	if raw[0] == '>'
		state[1] = '$S6\t'
		raw = raw.slice(1)

	for part in raw.split(/(?=[\/\&\=\*])/)
		if part[0] == '&'
			if part[1] == '-' or part[1] == '_'
				state[2] = '$S3' + part.slice(1)
			else
				state[2] = '$S3-' + part.slice(1)

		elif part[0] == '+'
			state[3] = '$S4-' + part.slice(1)
		elif part[0] == '='
			state[3] = part.slice(1)
		elif part[0] == '/'
			state[4] = part.slice(1)
		elif part[0] == '*'
			state[5] = part.slice(1)
		else
			state[0] = part
	return state.join('.')

def rewrite-token raw
	let orig = raw

	raw = raw.replace('$/','$S5')
	raw = raw.replace('$F','$S4')
	raw = raw.replace('$&','$S3')
	raw = raw.replace('$I','$S2')
	raw = raw.replace('$T','$S2')

	# if orig != raw
	return raw

def rewrite-actions actions,add
	if typeof actions == 'string' # and parts.indexOf('$') >= 0
		actions = {token: actions}

	if actions and actions.token != undefined
		actions.token = rewrite-token(actions.token)

		if typeof add == 'string'
			actions.next = add
		elif add
			Object.assign(actions,add)

		if actions.next
			actions.next = rewrite-state(actions.next)
		if actions.switchTo
			actions.switchTo = rewrite-state(actions.switchTo)

	elif actions and actions.cases
		let cases = {}
		for own k,v of actions.cases
			let newkey = rewrite-token(k)
			cases[newkey] = rewrite-actions(v)
		actions.cases = cases

	elif actions isa Array
		let result = []
		let curr = null
		for action,i in actions
			if action[0] == '@' and i == actions.length - 1 and curr
				action = {next: action}

			if typeof action == 'object'
				if action.token != undefined or action.cases
					result.push(curr = Object.assign({},action))
				else
					Object.assign(curr,action)
			elif typeof action == 'string'
				result.push(curr = {token: rewrite-token(action)})
		actions = result

	if actions isa Array
		for action,i in actions
			if action.token && action.token.indexOf('$$') >= 0
				action.token = action.token.replace('$$','$' + (i + 1))
			if action.next
				action.next = rewrite-state(action.next)
			if action.switchTo
				action.switchTo = rewrite-state(action.switchTo)

	return actions

def rewrite-rule owner, key
	let rule = owner[key]

for own key,rules of states
	let i = 0
	while i < rules.length
		let rule = rules[i]
		if rule[0] isa Array
			rules.splice(i,1,...rule)
			continue
		elif typeof rule == 'string'
			rules[i] = {include: rule}
		elif rule[1] isa Array
			rule[1] = rewrite-actions(rule[1])
		elif rule isa Array
			rule.splice(1,2,rewrite-actions(rule[1],rule[2]))
		i++

export const grammar = {
	defaultToken: 'invalid',
	ignoreCase: false,
	tokenPostfix: '',
	brackets: [
		{ open: '{', close: '}', token: 'bracket.curly' },
		{ open: '[', close: ']', token: 'bracket.square' },
		{ open: '(', close: ')', token: 'bracket.parenthesis' }
	],
	keywords: [
		'def', 'and', 'or', 'is', 'isnt', 'not', 'on', 'yes', '@', 'no', 'off',
		'true', 'false', 'null', 'this', 'self','as'
		'new', 'delete', 'typeof', 'in', 'instanceof',
		'return', 'throw', 'break', 'continue', 'debugger',
		'if', 'elif', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally',
		'class', 'extends', 'super',
		'undefined', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when',
		'tag', 'prop', 'attr', 'export', 'import', 'extend',
		'var', 'let', 'const', 'require', 'isa', 'await'
	],
	boolean: ['true','false','yes','no','undefined','null']
	operators: [
		'=', '!', '~', '?', ':','!!','??',
		'&', '|', '^', '%', '<<','!&',
		'>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '?=', '??=',
		'^=', '%=', '~=', '<<=', '>>=', '>>>=','..','...','||=',`&&=`,'**=','**',
		'|=?','~=?','^=?','=?','and','or'
	],
	assignments: [
		'=','|=?','~=?','^=?','=?',
		'^=', '%=', '~=', '<<=', '>>=', '>>>=',
		'||=',`&&=`,'?=','??=',
		'+=', '-=', '*=', '/=', '&=', '|=','**='
	]
	logic: [
		'>', '<', '==', '<=', '>=', '!=', '&&', '||','===','!=='
	],
	ranges: ['..','...']
	spread: ['...']
	dot: ['.']
	access: ['.','..']
	math: ['+', '-', '*', '/', '++', '--']

	unspaced_ops: regexify('... . .. + * ++ --')
	# comment: /#(\s.*)?(\n|$)/
	comment: /#(\s.*)?(?=\n|$)/
	# we include these common regular expressions
	symbols: /[=><!~?&%|+\-*\^,]+/,
	escapes: /\\(?:[abfnrtv\\"'$]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	postaccess: /(:(?=\w))?/
	ivar: /\@[a-zA-Z_]\w*/
	B: /(?=\s|$)/
	br:/[\r\n]+/
	constant: /[A-Z][\w\$]*(?:\-+[\w\$]+)*/
	# subIdentifer: /(?:\-*[\w\$]+)*/
	# identifier: /[a-z_]@subIdentifer/
	# anyIdentifier: /[A-Za-z_\$][\w\$]*(?:\-+[\w\$]+)*/
	# anyIdentifierOpt: /(?:@anyIdentifier)?/
	id:  /[A-Za-z_\$][\w\$]*(?:\-+[\w\$]+)*\??/
	classid: /\@?[A-Za-z_\$][\w\$]*(?:\-+[\w\$]+)*\??/
	plainid: /[A-Za-z_\$][\w\$]*(?:\-+[\w\$]+)*\??/
	fieldid: /[\@\#]*@plainid/
	propid: /[\@\#]*@plainid/
	defid: /[\@\#]*@plainid/
	decid: /\@(?:@plainid)?/
	symid: /\#+@plainid/
	envvar: /\$+[\w\-]+\$/
	symref: /\#+@plainid/

	optid: /(?:@id)?/
	# (?:\-+[\w\$]+)*\??
	esmIdentifier: /[A-Za-z_\$\@][\w\$]*(?:\-+[\w\$]+)*\??/
	propertyPath: /(?:[A-Za-z_\$][A-Za-z\d\-\_\$]*\.)?(?:[A-Za-z_\$][A-Za-z\d\-\_\$]*)/
	tagNameIdentifier: /(?:[\w\-]+\:)?\w+(?:\-\w+)*/
	variable: /[\w\$]+(?:-[\w\$]*)*\??/
	varKeyword: /var|let|const/
	tagIdentifier: /-*[\$a-zA-Z][\w\-\$]*/
	implicitCall: /(?!\s(?:and|or|is|isa)\s)(?=\s[\w\'\"\/\[\{])/ # not true for or etc
	cssModifier: /(?:\@+[\<\>\!]?[\w\-]+\+?|\.+@id\-?)/
	cssPropertyPath: /[\@\.]*[\w\-\$]+(?:[\@\.]+[\w\-\$]+)*/

	cssVariable: /(?:--|\$)[\w\-\$]+/
	cssPropertyName: /[\w\-\$]+/
	# cssModifier: /\@[\w\-\$]+/
	cssPropertyKey: /(?:@cssPropertyName(?:@cssModifier)*|\^*@cssModifier+)(?:\s*[\:\=])/
	cssUpModifier: /\.\.[\w\-\$]+/
	cssIsModifier: /\.[\w\-\$]+/

	regEx: /\/(?!\/\/)(?:[^\/\\]|\\.)*\/[igm]*/,
	regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
	regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
	# The main tokenizer for our languages
	tokenizer: states
}