import { Monarch } from '../program/monarch'

export def parseAsset raw,name
	# console.log 'parse asset',name,raw
	# what if we cannot parse this asset?
	let text = raw.body
	let xml = Monarch.getTokenizer('xml')
	let state = xml.getInitialState!
	let out = xml.tokenize(text,state,0)

	let attrs = {}
	let desc = {attributes: attrs, flags: []}

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
		# console.log tok.type,tok.value
		if tok.type == 'delimiter.xml' and val == '>'
			contentStart = tok.offset + 1
			break

	desc.content = text.slice(contentStart).replace('</svg>','')

	if attrs.class
		desc.flags = attrs.class.split(/\s+/g)
		delete attrs.class
	
	desc.flags.push("asset-{name.toLowerCase!}")

	delete attrs.xmlns
	# console.log 'returned',desc
	return desc
