import { Monarch } from 'imba/program'

export const language = {
	defaultToken: '',
	tokenPostfix: '.css',

	ws: '[ \t\n\r\f]*', # whitespaces (referenced in several rules)
	identifier: '-?-?([a-zA-Z]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))([\\w\\-]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))*',

	brackets: [
		{ open: '{', close: '}', token: 'delimiter.bracket' },
		{ open: '[', close: ']', token: 'delimiter.bracket' },
		{ open: '(', close: ')', token: 'delimiter.parenthesis' },
		{ open: '<', close: '>', token: 'delimiter.angle' }
	],

	tokenizer: {
		root: [
			{ include: '@selector' },
			
		],
		
		body: [
			['}', { token: 'delimiter.bracket', next: '@pop' }]
			{ include: '@selector' },
		]

		mediadeclaration: [
			['{', { token: 'delimiter.bracket', switchTo: '@body' }]
			[/./,'media']
		]

		selector: [
			{ include: '@comments' },
			{ include: '@import' },
			{ include: '@strings' },
			['[@](media)', { token: 'keyword', next: '@mediadeclaration' }],
			['[@](keyframes|-webkit-keyframes|-moz-keyframes|-o-keyframes)', { token: 'keyword', next: '@keyframedeclaration' }],
			['[@](page|content|font-face|-moz-document)', { token: 'keyword' }],
			['[@](charset|namespace)', { token: 'keyword', next: '@declarationbody' }],
			['(url-prefix)(\\()', ['attribute.value', { token: 'delimiter.parenthesis', next: '@urldeclaration' }]],
			['(url)(\\()', ['attribute.value', { token: 'delimiter.parenthesis', next: '@urldeclaration' }]],
			{ include: '@selectorname' },
			['[\\*]', 'tag'], // selector symbols
			['[>\\+,]', 'delimiter'], // selector operators
			['\\[', { token: 'delimiter.bracket', next: '@selectorattribute' }],
			['{', { token: 'delimiter.bracket', next: '@selectorbody' }]
		],

		selectorbody: [
			{ include: '@comments' },
			['[*_]?@identifier@ws:(?=(\\s|\\d|[^{;}]*[;}]))', 'attribute.name', '@rulevalue'], // rule definition: to distinguish from a nested selector check for whitespace, number or a semicolon
			['}', { token: 'delimiter.bracket', next: '@pop' }]
		],

		selectorname: [
			['(\\.|#(?=[^{])|%|(@identifier)|:)+', 'tag'], // selector (.foo, div, ...)
		],

		selectorattribute: [
			{ include: '@term' },
			[']', { token: 'delimiter.bracket', next: '@pop' }],
		],

		term: [
			{ include: '@comments' },
			['(url-prefix)(\\()', ['attribute.value', { token: 'delimiter.parenthesis', next: '@urldeclaration' }]],
			['(url)(\\()', ['attribute.value', { token: 'delimiter.parenthesis', next: '@urldeclaration' }]],
			{ include: '@functioninvocation' },
			{ include: '@numbers' },
			{ include: '@name' },
			['([<>=\\+\\-\\*\\/\\^\\|\\~,])', 'delimiter'],
			[',', 'delimiter']
		],

		rulevalue: [
			{ include: '@comments' },
			{ include: '@strings' },
			{ include: '@term' },
			['!important', 'keyword'],
			[';', 'delimiter', '@pop'],
			['(?=})', { token: '', next: '@pop' }] // missing semicolon
		],

		warndebug: [
			['[@](warn|debug)', { token: 'keyword', next: '@declarationbody' }]
		],

		import: [
			['[@](import)', { token: 'keyword', next: '@declarationbody' }]
		],

		urldeclaration: [
			{ include: '@strings' },
			['[^)\r\n]+', 'string'],
			['\\)', { token: 'delimiter.parenthesis', next: '@pop' }]
		],

		parenthizedterm: [
			{ include: '@term' },
			['\\)', { token: 'delimiter.parenthesis', next: '@pop' }]
		],

		declarationbody: [
			{ include: '@term' },
			[';', 'delimiter', '@pop'],
			['(?=})', { token: '', next: '@pop' }] // missing semicolon
		],

		comments: [
			['\\/\\*', 'comment', '@comment'],
			['\\/\\/+.*', 'comment']
		],

		comment: [
			['\\*\\/', 'comment', '@pop'],
			[/[^*/]+/, 'comment'],
			[/./, 'comment'],
		],

		name: [
			['@identifier', 'attribute.value']
		],

		numbers: [
			['-?(\\d*\\.)?\\d+([eE][\\-+]?\\d+)?', { token: 'attribute.value.number', next: '@units' }],
			['#[0-9a-fA-F_]+(?!\\w)', 'attribute.value.hex']
		],

		units: [
			['(em|ex|ch|rem|vmin|vmax|vw|vh|vm|cm|mm|in|px|pt|pc|deg|grad|rad|turn|s|ms|Hz|kHz|%)?', 'attribute.value.unit', '@pop']
		],

		keyframedeclaration: [
			['@identifier', 'attribute.value'],
			['{', { token: 'delimiter.bracket', switchTo: '@keyframebody' }],
		],

		keyframebody: [
			{ include: '@term' },
			['{', { token: 'delimiter.bracket', next: '@selectorbody' }],
			['}', { token: 'delimiter.bracket', next: '@pop' }],
		],

		functioninvocation: [
			['@identifier\\(', { token: 'attribute.value', next: '@functionarguments' }],
		],

		functionarguments: [
			['\\$@identifier@ws:', 'attribute.name'],
			['[,]', 'delimiter'],
			{ include: '@term' },
			['\\)', { token: 'attribute.value', next: '@pop' }],
		],

		strings: [
			['~?"', { token: 'string', next: '@stringenddoublequote' }],
			['~?\'', { token: 'string', next: '@stringendquote' }]
		],

		stringenddoublequote: [
			['\\\\.', 'string'],
			['"', { token: 'string', next: '@pop' }],
			[/[^\\"]+/, 'string'],
			['.', 'string']
		],

		stringendquote: [
			['\\\\.', 'string'],
			['\'', { token: 'string', next: '@pop' }],
			[/[^\\']+/, 'string'],
			['.', 'string']
		]
	}
}

export const tokenizer = Monarch.createTokenizer('css',language)