import { Monarch } from 'imba/program'

export const language = {
	tokenPostfix: '.js',

	keywords: [
		'break', 'case', 'catch', 'class', 'continue', 'const',
		'constructor', 'debugger', 'default', 'delete', 'do', 'else',
		'export', 'extends', 'false', 'finally', 'for', 'from', 'function',
		'get', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'null',
		'return', 'set', 'super', 'switch', 'symbol', 'this', 'throw', 'true',
		'try', 'typeof', 'undefined', 'var', 'void', 'while', 'with', 'yield',
		'async', 'await', 'of'
	],

	builtins: [
		'define','require','window','document','undefined'
	],

	operators: [
		'=', '>', '<', '!', '~', '?', ':',
		'==', '<=', '>=', '!=', '&&', '||', '++', '--',
		'+', '-', '*', '/', '&', '|', '^', '%', '<<',
		'>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
		'^=', '%=', '<<=', '>>=', '>>>='
	],

	# define our own brackets as '<' and '>' do not match in javascript
	brackets: [
		{ open: '(', close: ')', token: 'bracket.parenthesis' },
		{ open: '{', close: '}', token: 'bracket.curly' },
		{ open: '[', close: ']', token: 'bracket.square' }
	],

	# common regular expressions
	symbols: /[=><!~?:&|+\-*\/\^%]+/,
	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	exponent: /[eE][\-+]?[0-9]+/,

	digits: /\d+(_+\d+)*/,
	octaldigits: /[0-7]+(_+[0-7]+)*/,
	binarydigits: /[0-1]+(_+[0-1]+)*/,
	hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

	regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
	regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,

	tokenizer: {
		root: [
			# identifiers and keywords
			[/([a-zA-Z_\$][\w\$]*)(\s*)(:?)/, {
				cases: {
					'$1==import': { token: 'keyword', next: '@import' }, # ['keyword','white','delimiter', '@import'],
					'$1@keywords': ['keyword','white','delimiter'],
					'$3': ['key.identifier','white','delimiter'],   # followed by :
					'$1@builtins': ['predefined.identifier','white','delimiter'],
					'@default': ['identifier','white','delimiter'],
				}
			}],

			# whitespace
			{ include: '@whitespace' },

			# regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
			[/\/(?=([^\\\/]|\\.)+\/(?!\/))/, { token: 'regexp.slash', bracket: '@open', next: '@regexp'}],

			[/(<)([\:\w\.]+)/, ['start.delimiter.tag', { token: 'tag', next: '@tagContent'} ]],
			[/(<)(>)/, ['start.delimiter.tag', { token: 'end.delimiter.tag', next: '@tagBody'} ]],

			# delimiters and operators
			[/[{}()\[\]]/, '@brackets'],
			[/[;,.]/, 'delimiter'],
			[/@symbols/, { cases: {'@operators': 'operator', '@default': '' }}],

			# numbers
			[/\d+\.\d*(@exponent)?/, 'number.float'],
			[/\.\d+(@exponent)?/, 'number.float'],
			[/\d+@exponent/, 'number.float'],
			[/0[xX][\da-fA-F]+/, 'number.hex'],
			[/0[0-7]+/, 'number.octal'],
			[/\d+/, 'number'],

			{ include: '@strings' }
		],

		strings: [
			# strings: recover on non-terminated strings
			[/"([^"\\]|\\.)*$/, 'string.invalid' ],  # non-teminated string
			[/'([^'\\]|\\.)*$/, 'string.invalid' ],  # non-teminated string
			[/"/,  'string', '@string."' ],
			[/'/,  'string', '@string.\'' ],
			[/`/, 'string', '@string_backtick'],
		]

		rootInBrace: [
			[/\}/, 'delimiter', '@pop']
			{ include: '@root' }
		]

		tagContent: [
			[/\/\s*>/, 'end.delimiter.tag', '@pop' ]
			[/>/, { token: 'end.delimiter.tag', switchTo: '@tagBody' }],
			[/"([^"]*)"/, 'attribute.value'],
			[/'([^']*)'/, 'attribute.value'],
			[/[\w\-]+/, 'attribute.name'],
			[/\=/, 'delimiter'],
			[/\{/, 'delimiter', '@rootInBrace'],
			{ include: '@whitespace' }
		],

		tagBody: [
			[/\{/, 'delimiter', '@rootInBrace']
			[/(<\/)([:\w\.]*)(>)/, ['start.delimiter.tag', 'tag', {token: 'end.delimiter.tag', next: '@pop' }]]
			[/(<)([:\w\.]+)/, ['start.delimiter.tag', { token: 'tag', next: '@tagContent'} ]],
		],

		import: [
			[/;/, 'delimiter', '@pop']
			[/^/, 'white', '@pop']
			[/\b(from|as)\b/, 'keyword']
			{ include: '@whitespace' }
			{ include: '@strings' }
		],

		whitespace: [
			[/[ \t\r\n]+/, 'white'],
			[/\/\*/,       'comment', '@comment' ],
			[/\/\/.*$/,    'comment'],
		],

		comment: [
			[/[^\/*]+/, 'comment' ],
			# [/\/\*/, 'comment', '@push' ],    # nested comment not allowed :-(
			[/\/\*/,    'comment.invalid' ],
			["\\*/",    'comment', '@pop'  ],
			[/[\/*]/,   'comment' ]
		],

		string: [
			[/[^\\"']+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./,      'string.escape.invalid'],
			[/["']/,     {
				cases: {
					'$#==$S2': { token: 'string', next: '@pop' },
					'@default': 'string'
				}
			}]
		],
		string_backtick: [
			[/\$\{/, { token: 'delimiter.bracket', next: '@bracketCounting' }],
			[/[^\\`$]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/`/, 'string', '@pop']
		],
		bracketCounting: [
			[/\{/, 'delimiter.bracket', '@bracketCounting'],
			# numbers
			[/(@digits)[eE]([\-+]?(@digits))?/, 'number.float'],
			[/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, 'number.float'],
			[/0[xX](@hexdigits)n?/, 'number.hex'],
			[/0[oO]?(@octaldigits)n?/, 'number.octal'],
			[/0[bB](@binarydigits)n?/, 'number.binary'],
			[/(@digits)n?/, 'number'],

			# delimiter: after number because of .\d floats
			[/[;,.]/, 'delimiter'],
			[/\}/, 'delimiter.bracket', '@pop'],
		],

		# We match regular expression quite precisely
		regexp: [
			[/(\{)(\d+(?:,\d*)?)(\})/, ['@brackets.regexp.escape.control', 'regexp.escape.control', '@brackets.regexp.escape.control'] ],
			[/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/, ['@brackets.regexp.escape.control',{ token: 'regexp.escape.control', next: '@regexrange'}]],
			[/(\()(\?:|\?=|\?!)/, ['@brackets.regexp.escape.control','regexp.escape.control'] ],
			[/[()]/,        '@brackets.regexp.escape.control'],
			[/@regexpctl/,  'regexp.escape.control'],
			[/[^\\\/]/,     'regexp' ],
			[/@regexpesc/,  'regexp.escape' ],
			[/\\\./,        'regexp.invalid' ],
			['/',           { token: 'regexp.slash', bracket: '@close'}, '@pop' ],
		],

		regexrange: [
			[/-/,     'regexp.escape.control'],
			[/\^/,    'regexp.invalid'],
			[/@regexpesc/, 'regexp.escape'],
			[/[^\]]/, 'regexp'],
			[/\]/,    '@brackets.regexp.escape.control', '@pop'],
		],
	}
}

export const tokenizer = Monarch.createTokenizer('javascript',language)