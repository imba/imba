export const grammar = {
	defaultToken: ''
	tokenPostfix: '.xml'
	ignoreCase: true
	qualifiedName: /(?:[\w\.\-]+:)?[\w\.\-]+/

	tokenizer: {
		root: [
			[/[^<&]+/, ''],

			{ include: '@whitespace' },

			// Standard opening tag
			[/(<)(@qualifiedName)/, [
				{ token: 'delimiter' },
				{ token: 'tag', next: '@tag' }]],

			// Standard closing tag
			[/(<\/)(@qualifiedName)(\s*)(>)/, [
				{ token: 'delimiter' },
				{ token: 'tag' },
				'',
				{ token: 'delimiter' }
			]],

			// Meta tags - instruction
			[/(<\?)(@qualifiedName)/, [
				{ token: 'delimiter' },
				{ token: 'metatag', next: '@tag' }
			]],

			// Meta tags - declaration
			[/(<\!)(@qualifiedName)/, [
				{ token: 'delimiter' },
				{ token: 'metatag', next: '@tag' }
			]],

			// CDATA
			[/<\!\[CDATA\[/, { token: 'delimiter.cdata', next: '@cdata' }],

			[/&\w+;/, 'string.escape'],
		],

		cdata: [
			[/[^\]]+/, ''],
			[/\]\]>/, { token: 'delimiter.cdata', next: '@pop' }],
			[/\]/, '']
		],

		tag: [
			[/[ \t\r\n]+/, ''],
			[/(@qualifiedName)(\s*=\s*)("[^"]*"|'[^']*')/, ['attribute.name', '', 'attribute.value']],
			[/(@qualifiedName)(\s*=\s*)("[^">?\/]*|'[^'>?\/]*)(?=[\?\/]\>)/, ['attribute.name', '', 'attribute.value']],
			[/(@qualifiedName)(\s*=\s*)("[^">]*|'[^'>]*)/, ['attribute.name', '', 'attribute.value']],
			[/@qualifiedName/, 'attribute.name'],
			[/\?>/, { token: 'delimiter', next: '@pop' }],
			[/(\/)(>)/, [
				{ token: 'tag' },
				{ token: 'delimiter', next: '@pop' }]],
			[/>/, { token: 'delimiter', next: '@pop' }],
		],

		whitespace: [
			[/[ \t\r\n]+/, ''],
			[/<!--/, { token: 'comment', next: '@comment' }]
		],

		comment: [
			[/[^<\-]+/, 'comment.content'],
			[/-->/, { token: 'comment', next: '@pop' }],
			[/<!--/, 'comment.content.invalid'],
			[/[<\-]/, 'comment.content']
		]
	}
}
