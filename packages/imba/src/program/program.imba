import FileSystem from '../bundler/fs'
import Cache from '../bundler/cache'

export default class Program
	cachedir\string = null
	cwd\string = null
	config = {}
	volume = null
	cache = new Cache(self)
	fs = new FileSystem(cwd,self)

	def lookup path
		fs.lookup(path)