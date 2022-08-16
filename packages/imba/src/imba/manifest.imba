import {EventEmitter} from 'events'
import nfs from 'fs'
import np from 'path'
import {deserializeData,patchManifest,serializeData} from './utils'

class Asset
	def constructor manifest
		#manifest = manifest

	get absPath
		#absPath ||= #manifest.resolve(self)
	
	get name
		np.basename(path)

	get body
		readSync!

	def readSync
		nfs.readFileSync(absPath,'utf-8')

	def pipe res
		let stream = nfs.createReadStream(absPath)
		return stream.pipe(res)

	def toString
		url or absPath

export class Manifest < EventEmitter
	def constructor options = {}
		super()
		options = options
		data = {}
		path = options.path
		refs = {}
		reviver = do(key) new Asset(self)
		init(options.data)
	
	get srcdir do np.resolve(np.dirname(path),data.srcdir)
	get outdir do np.resolve(np.dirname(path),data.outdir)
	get pubdir do data.pubdir
	get changes do data.changes or {}
	get inputs do data.inputs
	get outputs do data.outputs
	get assets do data.assets

	get urls do data.urls or {}
	get main do data.main
	get cwd do process.cwd!

	get raw
		data.#raw
	
	def resolve path
		if path._ == 'input'
			return np.resolve(srcdir or cwd,path.path)
		elif path._ == 'output'
			return np.resolve(outdir,path.path)
		else
			return np.resolve(cwd,path.path or path)
			
	def resolveAssetPath path
		return np.resolve(outdir,path)
	
	def read path
		nfs.readFileSync(resolve(path),'utf-8')

	def loadFromFile path
		nfs.existsSync(path) ? nfs.readFileSync(path,'utf-8') : '{}'

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
			# don't want filesystem if we are using hmr
			path and !process.env.IMBA_HMR and nfs.watch(path) do(ev,name)
				let exists = nfs.existsSync(path)
				let stat = exists and nfs.statSync(path)
				update! if exists
				return

	# listen to updates etc
	def on event, cb
		watch!
		super

# let path = require.main.filename + '.manifest'
# new Manifest(path: process.env.IMBA_MANIFEST_PATH or path)
class LazyProxy
	static def for getter
		new Proxy({}, new self(getter))

	def constructor getter
		getter = getter
	
	get target
		getter!

	def get _, key
		target[key]
	
	def set _, key, value
		target[key] = value
		return true

export const manifest = LazyProxy.for do global.#manifest