import { window, SymbolKind, workspace } from 'vscode'
import np from 'path'

let debugChannel = window.createOutputChannel("Imba")

export def log msg, ...rest
	let conf = workspace.getConfiguration('imba').get("verbose")
	# debugChannel.appendLine("check logging?")
	# let conf = true
	if conf
		debugChannel.appendLine(msg)
		if rest.length
			debugChannel.appendLine(JSON.stringify(rest))

export def toPath doc
	let path = np.normalize(doc.fileName or doc.fsPath or doc.uri..fsPath)
	path.split('\\').join('/')

export def isImba src
	return false unless src
	src.substr(src.lastIndexOf(".")) == '.imba'

export def fastExtractSymbols text, filename = ''
	let lines = text.split(/\n/)
	let symbols = []
	let scope = {
		indent: -1,
		name: filename,
		kind: SymbolKind.File,
		children: []
	}
	let root = scope
	# symbols.root = scope
	let m
	let t0 = Date.now!

	for line,i in lines
		if line.match(/^\s*$/)
			continue

		let indent = line.match(/^\t*/)[0].length

		while scope.indent >= indent
			# close scope
			let curr = scope
			let last = curr.children[curr.children.length - 1]
			if last and scope.range
				scope.range.end = last.range.end

			scope = scope.#parent or root

		m = line.match(/^(\t*((?:export )?(?:static )?(?:extend )?)(class|tag|def|get|set|prop|attr) )(\@?[\w\-\$\:]+(?:\.[\w\-\$]+)?)/)
		# m ||= line.match(/^(.*(def|get|set|prop|attr) )([\w\-\$]+)/)

		if m
			let kind = m[3]
			let name = m[4]
			let ns = scope.name ? scope.name + '.' : ''
			let mods = m[2].trim().split(/\s+/)
			let md = ''

			let range = {
				start: {line: i, character: m[1].length}
				end: {line: i, character: m[0].length}
			}

			let selrange = {
				start: {line: i, character: m[1].length}
				end: {line: i, character: m[0].length}
			}

			let symbol = {
				kind: kind
				qualifiedName: ns + name
				name: name
				range: range
				selectionRange: selrange
				indent: indent
				modifiers: mods
				children: []
				#parent: scope == root ? null : scope
				type: kind
				data: {}
				static: mods.indexOf('static') >= 0
				extends: mods.indexOf('extend') >= 0
			}

			# if symbol.static
			#	symbol.containerName = 'static'

			symbol.containerName = scope..name

			if kind == 'tag' and m = line.match(/\<\s+([\w\-\$\:]+(?:\.[\w\-\$]+)?)/)
				symbol.superclass = m[1]

			if scope.type == 'tag'
				md = "```html\n<{scope.name} {name}>\n```\n"
				symbol.description = {kind: 'markdown',value: md}

			scope.children.push(symbol)
			scope = symbol

			symbols.push(symbol)

	root.all = symbols
	# console.log 'fast outline',text.length,Date.now! - t0
	return root