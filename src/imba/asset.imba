# create proxy

import {manifest} from './manifest'

class AssetProxy
	static def wrap meta
		let handler = new AssetProxy(meta)
		new Proxy(handler,handler)

	def constructor meta
		meta = meta

	get input
		manifest.inputs.node[meta.input]

	get asset
		$web$ ? meta : input.asset
	
	def set target, key, value
		return true

	def get target, key
		if meta.meta and meta.meta[key] != undefined
			return meta.meta[key]

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
		return data.#asset ||= AssetProxy.wrap(data)
	
	return data