import fspath from 'path'

export def extractDependencies code, replacer = null
	let deps = {}
	let offset = 0
	let pre = '/*$path$*/'
	let post = '/*$*/'

	let locs = deps.#locations = []

	while true
		let index = code.indexOf(pre,offset)
		break if index == -1
		offset = index + pre.length
		let end = code.indexOf(post,offset)
		let part = code.slice(offset,end).slice(1,-1)
		locs.push([offset + 1,end - 1,part])
		deps[part] = part
	return deps

export def resolveDependencies importer, code, resolver, context = {}

	let imp = context.importer ||= importer
	context.resolveDir ||= imp.slice(0,imp.lastIndexOf('/') + 1)
	
	# fspath.dirname(context.importer)

	let outcode = code
	let deps = extractDependencies(code)
	let locs = deps.#locations.slice(0).reverse!
	let resolved = Object.assign({},deps)
	if resolver isa Function
		for own key,dep of deps
			let res = resolver(Object.assign({path: key},context))
			resolved[key] = res if res != null

	for [start,end,part] in locs
		let replacement = resolved[part]
		outcode = outcode.slice(0,start) + replacement + outcode.slice(end)

	return outcode