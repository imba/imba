# imba$stdlib=1

def injectStringBefore target, toInject, patterns = ['']
	for patt in patterns
		let idx = target.indexOf(patt)
		if idx >= 0
			return target.slice(0,idx) + toInject + target.slice(idx)
	return target

import fs from 'fs'

class ImbaAsset
	def constructor src
		src = src

	get entry
		global.IMBA_MANIFEST..[src]

	get url
		entry ? entry.url : src

	get path
		entry ? entry.path : null

	get body
		if $node$
			if path
				return fs.readFileSync(path,'utf-8')
		return null

	def toString
		url

export def asset src
	if let asset = global.IMBA_MANIFEST..[src]
		return new ImbaAsset(src)
		# return asset.url or asset
	return src

class HtmlAsset
	def constructor text,refs
		text = text
		refs = refs

	get body
		let res = text.replace(/ASSET_REF_(\d+)/g) do(m,nr)
			let ref = refs[nr]
			if ref isa ImbaAsset
				return String(ref)
			if let asset = global.IMBA_MANIFEST..[String(ref)]
				return asset.url
			return ref

		if global.IMBA_HMR_PATH
			res = injectStringBefore(res,"<script src='/__hmr__.js'></script>",['<!--$head$-->','<!--$body$-->','<html',''])
		return res

	def toString
		body

export def html text, refs
	return new HtmlAsset(text,refs)