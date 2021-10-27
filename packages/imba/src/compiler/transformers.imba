import fspath from 'path'

export def extractDependencies code, replacer = null
	let deps = {}
	let offset = 0

	let locs = deps.#locations = []

	while true
		# what if this is for css
		let index = code.indexOf('/*$path$*/',offset)

		break if index == -1

		let end = index - 1
		let start = end - 1
		let endchr = code[end]
		let startchr = endchr == ')' ? '(' : endchr

		while start > 0 and code[start - 1] != startchr
			--start

		

		if endchr == ')' and (code[start] == '"' or code[start] == "'")
			start += 1
			end -= 1

		let part = code.slice(start,end)
		locs.push([start,end,part])
		deps[part] = part
		offset = index + 3

	return deps

export def resolveDependencies importer, code, resolver, context = {}

	let imp = context.importer ||= importer
	context.resolveDir ||= imp.slice(0,imp.lastIndexOf('/') + 1)
	
	# fspath.dirname(context.importer)

	let outcode = code
	let deps = extractDependencies(code)
	let locs = deps.#locations.slice(0).reverse!
	let resolved = Object.assign({},deps)
	
	for own key,dep of deps
		let res = null
		if resolver isa Function
			res = resolver(Object.assign({path: key},context))
		elif resolver[key]
			res = resolver[key]
		resolved[key] = res if res != null

	for [start,end,part] in locs
		let replacement = resolved[part]
		outcode = outcode.slice(0,start) + replacement + outcode.slice(end)

	return outcode