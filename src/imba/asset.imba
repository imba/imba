# create proxy

import {manifest} from './manifest'

class AssetProxy
	static def wrap meta
		let handler = new AssetProxy(meta)
		new Proxy(handler,handler)

	def constructor meta
		meta = meta

	get input
		manifest.inputs[meta.input]

	get asset
		globalThis._MF_ ? meta : (input ? input.asset : null)
	
	def set target, key, value
		return true

	def get target, key
		if meta.meta and meta.meta[key] != undefined
			return meta.meta[key]
			
		unless asset
			if meta.#warned =? yes
				console.warn "Asset for '{meta.input}' not found"

			if key == 'valueOf'
				return do ""
			return null
			
		if key == 'absPath' and !asset.absPath
			return asset.url	

		asset[key]

class SVGAsset
	prop url
	prop meta

	def adoptNode node
		if meta..content
			for own k,v of meta.attributes
				node.setAttribute(k,v)
			node.innerHTML = meta.content
		self
	
	def toString
		url
	
	def toStyleString
		"url({url})"


export def asset data
	if data.#asset
		return data.#asset

	if data.type == 'svg'
		return data.#asset ||= new SVGAsset(data)
	
	if data.input
		let extra = globalThis._MF_ and globalThis._MF_[data.input]
		if extra
			Object.assign(data,extra)
			data.toString = do this.absPath
			# data.#asset = data
		return data.#asset ||= AssetProxy.wrap(data)
	
	return data