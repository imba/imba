import {EventEmitter} from 'events'
import nfs from 'fs'
import np from 'path'
import {deserializeData,patchManifest,serializeData} from './utils'

class Asset
	def constructor manifest
		#manifest = manifest

	get abspath
		#abspath ||= #manifest.resolve(self)

	def readSync
		nfs.readFileSync(abspath,'utf-8')

	def toString
		console.log 'asset toString',url
		url

class AssetReference
	def constructor manifest, path
		manifest = manifest
		path = path

	get web
		try manifest.inputs.web[path]

	get js
		web..js

	get css
		web..css

export class Manifest < EventEmitter
	def constructor options = {}
		super()
		options = options
		path = options.path
		dir = path and np.dirname(path)
		refs = {}
		reviver = do(key) new Asset(self)
		init(options.data)

	def assetReference path,...rest
		return path if typeof path != 'string'
		refs[path] ||= new AssetReference(self,path)

	get assetsDir do data.assetsDir
	get assetsUrl do data.assetsUrl
	get changes do data.changes or {}
	get inputs do data.inputs
	get urls do data.urls or {}
	get main do data.main
	get cwd do process.cwd!
	
	def resolve path
		if path._ == 'input'
			return np.resolve(cwd,path.path)
		elif path._ == 'output'
			return np.resolve(dir,path.path)
		else
			return np.resolve(cwd,path.path or path)
	
	def read path
		nfs.readFileSync(resolve(path),'utf-8')

	def loadFromFile path
		nfs.readFileSync(path,'utf-8')

	def init data = null
		if data or path
			update(data)
		self

	def update raw 
		if raw == null
			if path
				raw = loadFromFile(path)
			else
				console.warn "cannot update manifest without path"

		if typeof raw == 'string'
			let str = raw
			raw = deserializeData(raw,reviver) # pass in the objects we want to wrap them with?
			raw.#raw = str

		data = patchManifest(data or {},raw)
		
		if data.changes.all.length
			emit('change',diff,self)
		if data.changes.main
			emit('change:main',data.main,self)
		return data.changes

	def serializeForBrowser
		return data.#raw

	def #refresh data
		yes

	def watch
		if #watch =? yes
			path and nfs.watch(path) do(ev,name)
				console.log 'watch manifest!',ev,path
				let exists = nfs.existsSync(path)
				let stat = exists and nfs.statSync(path)
				update! if exists
				return

	# listen to updates etc
	def on event, cb
		watch!
		super

const defaultPath = global.IMBA_MANIFEST_PATH or (global.IMBA_ENTRYPOINT ? global.IMBA_ENTRYPOINT + '.manifest' : null)
export const manifest = new Manifest(path: defaultPath)
global.#manifest = manifest

export def assetReference path,...wildcards
	manifest.assetReference(path,...wildcards)