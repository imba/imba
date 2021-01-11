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


export def asset data
	if data.input
		return data.#asset ||= AssetProxy.wrap(data)
	
	return data