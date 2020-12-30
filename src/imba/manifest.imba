import {EventEmitter} from 'events'
import fs from 'fs'
import np from 'path'

const mimes = {
	svg: 'image/svg+xml'
	html: 'text/html'
	jpg: 'image/jpeg'
	jpeg: 'image/jpeg'
	js: 'text/javascript'
	mjs: 'text/javascript'
	json: 'application/json'
	otf: 'font/otf'
	ttf: 'font/ttf'
	woff: 'font/woff'
	woff2: 'font/woff2'
	png: 'image/png'
	css: 'text/css'
}

# 
class AssetReference
	def constructor manifest, path
		manifest = manifest
		path = path
	
	get data
		try manifest.data.assets[path]

	get js
		data..js

	get css
		data..css	


class Asset
	def constructor desc
		desc = desc

	get url do desc.url
	get path do desc.path
	get hash do desc.hash
	get ext do #ext ||= np.extname(desc.path).substr(1)
	get body do #body ||= fs.readFileSync(desc.path,'utf8')

	get headers
		{
			'Content-Type': mimes[ext] or 'text/plain'
			'Access-Control-Allow-Origin': '*'
			'cache-control': 'public'
		}

class Manifest < EventEmitter
	def constructor cwd = process.cwd!
		super()
		cwd = cwd
		path = global.IMBA_MANIFEST_PATH or np.resolve(cwd,'imbabuild.json')
		
		data = load! or {}
		refs = {}
		console.log 'manifest loaded!',data

	def assetReference path,...rest
		if typeof path != 'string'
			return path

		refs[path] ||= new AssetReference(self,path)

	get assetsDir
		data.assetsDir

	get assetsUrl
		data.assetsUrl

	get changes
		data.changes or []

	def asset src
		if data.assets and data.assets[src]
			console.log 'returning asset!!',data.assets[src]
			return data.assets[src]

	def load
		let raw = fs.readFileSync(path,'utf-8')
		try
			JSON.parse(raw)
		catch e
			console.log "json loading error",e
			console.log raw


	def assetByName name
		return unless data.assets and name
		if let asset = data.assets[name]
			return asset.#rich ||= new Asset(asset)

	def urlForAsset name
		if let asset = assetByName(name)
			return asset.url
		return null

	def assetForUrl url
		let pathname = url.split('?')[0]

		return assetByName(data and data.urls and data.urls[pathname])

	def watch
		if #watch =? yes
			fs.watch(path) do(curr,prev)
				let updated = load!
				data = updated

				emit('update',data.changes,self)

				let changedAssets = for item in data.changes
					let entry = data.files[item]
					continue unless entry.url
					entry.url

				if changedAssets.length
					emit('invalidate',changedAssets)

	# listen to updates etc
	def on event, cb
		watch!
		super

export const manifest = new Manifest
global.#manifest = manifest

export def assetReference path,...wildcards
	manifest.assetReference(path,...wildcards)