import {deserializeData,patchManifest} from './utils'

class AssetReference
	def constructor manifest, path
		manifest = manifest
		path = path
	
	get data
		try manifest.data.assets[path]

	get web
		try manifest.inputs.web[path]

	get js
		web..js

	get css
		web..css

class Manifest
	def constructor
		refs = {}

	def assetReference path,...rest
		if typeof path != 'string'
			return path

		refs[path] ||= new AssetReference(self,path)

	get data
		#data ||= deserializeData(global.IMBA_MANIFEST or '{}')

	set data value
		#data = value

	get assetsDir do data.assetsDir
	get assetsUrl do data.assetsUrl
	get changes do data.changes or {}
	get inputs do data.inputs
	get urls do data.urls
	get main do data.main

	def init raw
		update(raw)
	
	def update raw
		if typeof raw == 'string'
			raw = deserializeData(raw)

		data = patchManifest(data,raw)
		return data.changes

	

export const manifest = new Manifest
global.#manifest = manifest

export def assetReference path,...wildcards
	manifest.assetReference(path,...wildcards)