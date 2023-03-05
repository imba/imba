import { Monarch } from '../program/monarch'

export def parseAsset raw,name
	# console.log 'parse asset',name,raw
	# what if we cannot parse this asset?
	let text = raw.body
	
	let startIndex = text.indexOf('<svg')
	
	if startIndex > 0
		text = text.slice(startIndex)
	
	let xml = Monarch.getTokenizer('xml')
	let state = xml.getInitialState!
	let out = xml.tokenize(text,state,0)

	let attrs = {}
	let desc = {attributes: attrs, flags: []}
	
	# for inlined assets - skip everything before the svg
	
	let currAttr
	let contentStart = 0
	for tok in out.tokens
		let val = tok.value
		if tok.type == 'attribute.name.xml'
			currAttr = tok
			attrs[val] = yes
		if tok.type == 'attribute.value.xml'
			let len = val.length
			if len > 2 and val[0] == val[len - 1] and (val[0] == '"' or val[0] == "'")
				val = val.slice(1,-1)
			attrs[currAttr.value] = val

		if tok.type == 'delimiter.xml' and val == '>'
			contentStart = tok.offset + 1
			break

	desc.content = text.slice(contentStart).replace('</svg>','')

	if attrs.class
		desc.flags = attrs.class.split(/\s+/g)
		delete attrs.class
	
	if name
		desc.flags.push("asset-{name.toLowerCase!}")

	delete attrs.xmlns
	return desc


export def parseHTML raw
	let text = raw.body
	let xml = Monarch.getTokenizer('xml')
	let state = xml.getInitialState!
	let out = xml.tokenize(text,state,0)

	let currAttr
	let contentStart = 0
	let currTag = {
		attributes: {}
		#attributes: {}
	}
	let tags = []
	let result = {
		text: raw
	}
	let imports = result.imports = []
	let newtext = ""
	let reftags = new Set
	let tokens = out.tokens.slice(0)
	for tok,i in tokens
		let typ = tok.type
		let val = tok.value
		let prev = out.tokens[i - 1]

		if typ == 'tag.xml'
			if prev.value == '<'
				tags.push(currTag = tok)
				tok.attributes = {}
				tok.#attributes = {}
				tags[val] ||= []
				tags[val].push(tok)
			elif prev.value == '</'
				currTag.closer ||= tok
				yes

		if typ == 'delimiter.xml' and val == '>'
			let currTyp = currTag..value
			if currTyp == 'head' or currTyp == 'body'
				tok.value += "<!--${currTyp}$-->"

		if typ == 'attribute.name.xml'
			currTag.#attributes[val] = tok
			currAttr = val

		if typ == 'attribute.value.xml'
			let unquoted = val
			if val.length > 2 and val[0] == val[val.length - 1] and (val[0] == '"' or val[0] == "'")
				unquoted = val.slice(1,-1)

			tok.raw = unquoted
			currTag.attributes[currAttr] = tok

	for el in tags
		let item = null
		let src = el.attributes.src

		if el.value == 'script' and src
			item = {path: src.raw, tagType: 'script'}
		elif el.value == 'img' and src
			item = {path: src.raw, tagType: 'img'}
		elif el.value == 'link'
			let rel = el.attributes.rel..raw
			src = el.attributes.href
			let raw = src..raw or ''
			if rel == 'stylesheet'
				item = {path: raw, tagType: 'style'}
			elif src and raw.match(/^\.\.?\//)
				let raw = src.raw
				# if we link to a json file - load it as a url?
				# if raw.match(/\.json$/)
				#	raw = raw += '?url'
				item = {path: raw, tagType: 'link'}

		elif el.value == 'style' and src
			item = {path: src.raw, tagType: 'style'}
			el.value = "link rel='stylesheet'"
			el.closer.value = 'link' if el.closer
			if el.#attributes.src
				el.#attributes.src.value = 'href'

		if src and item
			unless item.path.match(/^(\/|\w+?\:\/\/)/)
				let nr = imports.push(item)
				src.value = "'ASSET_REF_{nr - 1}'"
		# if currAttr == 'src' or (currAttr == 'href' and currTag.value == 'link')

	let outstr = ""
	for tok in tokens
		outstr += tok.value
		
	result.contents = outstr.replace(/<\/link>/g,'')
	# console.log tags.script
	return result
