# imba$stdlib=1

def injectStringBefore target, toInject, patterns = ['']
	for patt in patterns
		let idx = target.indexOf(patt)
		if idx >= 0
			return target.slice(0,idx) + toInject + target.slice(idx)
	return target

export def asset src
	return src

class HtmlAsset
	def constructor text,refs
		text = text
		refs = refs

	get body
		let res = text.replace(/ASSET_REF_(\d+)/g) do(m,nr)
			let ref = refs[nr]
			if let asset = global._MF_..[ref]
				return asset.url
			return ref

		if true
			res = injectStringBefore(res,"<script src='/__hmr__.js'></script>",['<!--$head$-->','<!--$body$-->','<html',''])
		return res

	def toString
		body

export def html text, refs
	return new HtmlAsset(text,refs)