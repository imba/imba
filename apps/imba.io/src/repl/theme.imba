export const theme =
	base: 'vs-dark', # can also be vs-dark or hc-black
	inherit: false, # can also be false to completely replace the builtin rules

	named:
		background: '202732'
		foreground: 'D4D4D4'
		keyword: 'ff9696'
		operator: 'ff9696'
		# string: 'B7DE95'
		dimdelimiter: '6d829b'
		number: '#29a7e4' # 598DA6
		bool: '29a7e4'
		symbol: 'B7DE95'
		regex: 'FD9231'
		regexgroup: 'FFB26D'
		comment: '5D6E7A'
		constant: 'c1a5d6'
		identifier: '9dcbeb' # 'd4d4d4'
		xml: 'e9e19b'
		xmlref: 'd2845f'
		decl: '75AAFF'
		key: 'a7c9de'
		lineNumber: '3b4750'
		agentCursor: '89b0fc'
		localCursor: 'ffe796'
		lvar: 'dcdbc7'
		limport: '91b7ea'
		variable: 'e8e6cb'
		context: '63b3ed' 
		string: '7da4b7' # a0c6ca
		property: 'F7FAFC'
		tagbase: 'e9e19b' # c3b17e
		tagname: 'e9e19b'
		tagref: 'ffae86'
		tagstr: 'a0c6ca'
		tagop: 'd17e53'
		tagbracket: '9d9755'
		tagattr: 'e9e19b'
		tagmodifier: 'e9e19b'
		taglistener: 'e9e19b'
		special: 'ffdb59'
		mixin: 'ffc87c'

		sel: 'e9e19b'
		selpseudo: 'eec49d'
		cssproperty: 'e0ade3'
		csspropertymod:'df8de4'
		cssvalue: 'a49feb'
		cssunit: 'ff8c8c'
		cssdelim: 'dbaadf'



	toMonaco: do
		var json = JSON.stringify(this)
		var named = this.named
		json = json.replace(/@(\w+)/g) do(m,key)
			named[key] or m
		return JSON.parse(json)

	toTheme: do
		var theme = this.toMonaco!
		var colors = theme.tokenColors = []
		for rule in theme.rules
			continue unless rule.foreground

			let item =
				name: rule.token,
				scope: rule.token
				settings: { foreground: '#'+rule.foreground }

			colors.push(item)

		delete theme.rules
		delete theme.colors
		theme.type = 'dark'
		theme.name = "Imba Dark"
		return theme

	rules: [
		{ token: '', foreground: '@foreground', background: '@background' },
		{ token: 'invalid', foreground: 'f44747' },
		{ token: 'emphasis', fontStyle: 'italic' },
		{ token: 'strong', fontStyle: 'bold' },

		{ token: 'property', foreground: '@property' },
		{ token: 'variable', foreground: '@variable' },
		{ token: 'variable.predefined', foreground: '@keyword' },
		{ token: 'variable.parameter', foreground: '9CDCFE' },
		{ token: 'identifier', foreground: '@identifier' },
		{ token: 'accessor', foreground: 'F3F3F3' },
		{ token: 'identifier.const', foreground: '@constant' },
		{ token: 'identifier.constant', foreground: '@constant' },
		{ token: 'identifier.const.class', foreground: '@decl' },
		{ token: 'identifier.class', foreground: '@decl' },
		{ token: 'identifier.classname', foreground: '@decl' },
		{ token: 'identifier.const.tag', foreground: '@decl' },
		{ token: 'identifier.decl', foreground: '@decl' },
		{ token: 'identifier.tag', foreground: '@decl' },
		{ token: 'identifier.tagname', foreground: '@decl' },
		{ token: 'identifier.def', foreground: '@decl' },
		{ token: 'identifier.key', foreground: '@key' },
		{ token: 'identifier.env', foreground: '@keyword' },
		{ token: 'identifier.special', foreground: '@special' },
		{ token: 'identifier.import', foreground: '@limport' },
		{ token: 'identifier.symbol', foreground: '@keyword' },
		
		{ token: 'entity.name', foreground: '@decl'},
		{ token: 'entity.name.type', foreground: '@decl'},
		{ token: 'entity.name.function', foreground: '@decl'},
		{ token: 'entity.name.tag', foreground: '@xml'}

		{ token: 'path', foreground: '@string'}
		{ token: 'self', foreground: '@context'}
		{ token: 'this', foreground: '@context'}

		{ token: 'storage.type.function', foreground: '@keyword'},
		{ token: 'storage.type.class', foreground: '@keyword'},

		{ token: 'comment', foreground: '@comment' },
		{ token: 'operator', foreground: '@operator' },
		{ token: 'number', foreground: '@number' },
		{ token: 'number.hex', foreground: '@number' },
		{ token: 'numeric.css', foreground: '@number' },
		{ token: 'regexp', foreground: '@regex' },
		{ token: 'regexp.escape', foreground: '@regexgroup' },
		{ token: 'annotation', foreground: 'cc6666' },
		{ token: 'type', foreground: '3DC9B0' },
		{ token: 'boolean', foreground: '@bool' },
		{ token: 'unit', foreground: '@cssunit'},

		{ token: 'constant.numeric', foreground: '@number' },
		{ token: 'constant.language.boolean', foreground: '@bool' },

		{ token: 'delimiter', foreground: 'DCDCDC' },
		{ token: 'delimiter.access.imba', foreground: 'DCDCDB' },
		{ token: 'delimiter.html', foreground: '808080' },
		{ token: 'delimiter.xml', foreground: '808080' },
		{ token: 'delimiter.eq.tag', foreground: 'ea9b7c'},

		{ token: 'tag', foreground: '@tagbase' },
		{ token: 'tag.name', foreground: '@tagname' },
		{ token: 'tag.open', foreground: '@tagbracket' },
		{ token: 'tag.close', foreground: '@tagbracket' },
		{ token: 'tag.attribute', foreground: '@tagattr' }
		{ token: 'tag.mixin', foreground: '@mixin' },
		{ token: 'tag.reference', foreground: '@tagref' },
		{ token: 'tag.attribute.listener', foreground: '@taglistener' },
		{ token: 'tag.attribute.modifier', foreground: '@tagmodifier' },
		{ token: 'tag.operator', foreground: '@operator' },
		{ token: 'paren.open.tag', foreground: '@taglistener' },
		{ token: 'paren.close.tag', foreground: '@taglistener' },
		
		{ token: 'meta.scss', foreground: 'A79873' },
		{ token: 'meta.tag', foreground: '@xml' },
		{ token: 'metatag', foreground: 'DD6A6F' },
		{ token: 'metatag.content.html', foreground: '9CDCFE' },
		{ token: 'metatag.html', foreground: '569CD6' },
		{ token: 'metatag.xml', foreground: '569CD6' },
		{ token: 'metatag.php', fontStyle: 'bold' },

		{ token: 'key', foreground: '@key' },
		{ token: 'operator.assign.key', foreground: '@key' },
		{ token: 'string.key.json', foreground: '9CDCFE' },
		{ token: 'string.value.json', foreground: 'CE9178' },

		{ token: 'attribute.name', foreground: '@key' },
		{ token: 'attribute.value', foreground: '@number' },
		{ token: 'attribute.value.number.css', foreground: '@number' },
		{ token: 'attribute.value.unit.css', foreground: '@number' },
		{ token: 'attribute.value.hex.css', foreground: '@number' },

		{ token: 'string', foreground: '@string' },
		{ token: 'string.sql', foreground: '@string' },

		{ token: 'keyword', foreground: '@keyword' },
		{ token: 'keyword.flow', foreground: '@keyword' },
		{ token: 'keyword.json', foreground: '@keyword' },
		{ token: 'keyword.flow.scss', foreground: '@keyword' },

		{ token: 'operator.scss', foreground: '909090' },
		{ token: 'operator.sql', foreground: '778899' },
		{ token: 'operator.swift', foreground: '909090' },
		{ token: 'predefined.sql', foreground: 'FF00FF' },

		# css
		{token: "entity.name.selector.css", foreground: '@xml'}
		{token: "support.type.property-name.css", foreground: '@decl'}
		{token: "meta.object-literal.key", foreground: '@key'}

		{token: "style.selector", foreground: '@sel'}
		{token: "style.property", foreground: '@cssproperty'}
		{token: "style.property.modifier", foreground: '@csspropertymod'}
		{token: 'style.mixin', foreground: '@mixin' }
		{token: 'delimiter.style', foreground: '@cssdelim' }
		{token: "style.value", foreground: '@cssvalue'}
		{token: "style.value.size", foreground: '@cssunit'}
		{token: "style.start-operator", foreground: '@dimdelimiter'}
		{token: "style.open", foreground: '@xml'}
		{token: "style.close", foreground: '@xml'}
	]
	colors:
		'foreground': '#@foreground'
		'editor.background': '#@background'
		'editorGutter.background': '#@background'
		'editor.selectionBackground': '#30455f' # #33393f
		'editorLineNumber.foreground': '#3c4e5d'
		'editorWidget.background': '#2d3748'
		'editorWidget.border': '#222a38'
		'list.focusBackground': '#33393f'
		'list.hoverBackground': '#@background'
		'list.highlightForeground': '#ffffff'
		'input.foreground': '#ffffff'
		'editorSuggestWidget.foreground': '#@foreground'
		'editorHoverWidget.background': '#2d3748' # '#222a38' # '#2d3748'
		'editorHoverWidget.border': '#222a38'
		'editorError.foreground': '#f56565'
		'editorCursor.foreground': '#@agentCursor'
		'widget.shadow': '#252d37' # '0 0px 0px 1px rgb(37, 42, 50)'
		'input.background': '#252c37'
		'input.border': '#2a323f'