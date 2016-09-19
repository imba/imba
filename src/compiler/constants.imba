# List of the token pairs that must be balanced.
export var BALANCED_PAIRS = [
	['(', ')']
	['[', ']']
	['{', '}']
	['{{', '}}']
	['INDENT', 'OUTDENT'],
	['CALL_START', 'CALL_END']
	['PARAM_START', 'PARAM_END']
	['INDEX_START', 'INDEX_END']
	['TAG_START','TAG_END']
	['BLOCK_PARAM_START','BLOCK_PARAM_END']
]

# The inverse mappings of `BALANCED_PAIRS` we're trying to fix up, so we can
# look things up from either end.
export var INVERSES = {}

# The tokens that signal the start/end of a balanced pair.
# var EXPRESSION_START = []
# var EXPRESSION_END   = []

for pair in BALANCED_PAIRS
	var left = pair[0]
	var rite = pair[1]
	INVERSES[rite] = left
	INVERSES[left] = rite


export var ALL_KEYWORDS = [
	'true', 'false', 'null', 'this',
	'delete', 'typeof', 'in', 'instanceof',
	'throw', 'break', 'continue', 'debugger',
	'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally',
	'class', 'extends', 'super', 'return',
	'undefined', 'then', 'unless', 'until', 'loop', 'of', 'by',
	'when','def','tag','do','elif','begin','var','let','self','await','import',
	'and','or','is','isnt','not','yes','no','isa','case','nil','require'
]

export var TOK =
	TERMINATOR: 'TERMINATOR'
	INDENT: 'INDENT'
	OUTDENT: 'OUTDENT'
	DEF_BODY: 'DEF_BODY'
	THEN: 'THEN'
	CATCH: 'CATCH'
