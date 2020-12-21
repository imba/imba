import {EventEmitter} from 'events'
import fs from 'fs'
import fsp from 'path'

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

class Asset
	def constructor desc
		desc = desc

	get url do desc.url
	get path do desc.path
	get hash do desc.hash
	get ext do #ext ||= fsp.extname(desc.path).substr(1)
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
		path = fsp.resolve(cwd,'imbabuild.json')
		data = load! or {}

	get changes
		data.changes or []

	def load
		try JSON.parse(fs.readFileSync(path,'utf-8'))

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