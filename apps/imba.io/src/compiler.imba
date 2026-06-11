import * as esml from 'es-module-lexer'

const ResolveMap = {
	'imba': 'https://unpkg.com/imba@2.0.0-alpha.243/dist/imba.mjs'
	'imba/runtime': 'https://unpkg.com/imba@2.0.0-alpha.243/src/imba/runtime.mjs'
	'imdb': '/imdb.js'
}

export def rewriteImports body, map = ResolveMap
	const [imports, exports] = esml.parse(body)
	for imp in imports.reverse!
		imp.n = 'imdb' if imp.n.indexOf('imdb') >= 0

		if let remap = map[imp.n]
			console.log 'replacing path',imp.n,remap
			body = body.slice(0,imp.s) + String(remap) + body.slice(imp.e)
	return body