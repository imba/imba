import fspath from 'path'

export def extractDependencies code, replacer = null
	let deps = {}
	let offset = 0
	let pre = '/*$path$*/'
	let post = '/*$*/'

	let locs = deps.#locations = []

	while true
		# what if this is for css
		let index = code.indexOf(pre,offset)
		break if index == -1
		offset = index + pre.length

		let url = code.substr(offset,4) == 'url('
		let end = code.indexOf(post,offset)
		let [loff,roff] = url ? [4,1] : [1,1]

		if url
			let q = code[offset + loff]
			if q == '"' or q == "'" and q == code[end - roff]
				loff += 1
				roff += 1

		let part = code.slice(offset,end)
		part = part.slice(loff,-roff)
		locs.push([offset + loff,end - roff,part])
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