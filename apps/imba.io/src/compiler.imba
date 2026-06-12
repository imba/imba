import * as esml from 'es-module-lexer'

# examples are compiled with the bundled imba compiler, so they must run
# against the matching runtime - served locally by the site itself
export const ResolveMap = {
	'imba': '/vendor/imba.mjs'
	'imba/runtime': '/vendor/imba-runtime.mjs'
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