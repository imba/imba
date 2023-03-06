import Component from './component'
import ChangeLog from './changes'
import np from 'path'

const FLAGS = {
	CHANGE: 1
	ADD: 2
	UNLINK: 4
}

export default class Watcher < Component

	def constructor fs
		super()
		fs = fs
		history = new ChangeLog withFlags: yes
		events = []
		map = {}
		map[fs.cwd] = 1

	get instance
		return #watcher if #watcher
		if $node$
			let normalize = do(src) src.split(np.sep).join(np.posix.sep)
			let initial = Object.keys(map)
			#watcher = require('chokidar').watch(initial,{
				ignoreInitial: true,
				depth: 1,
				ignored: isIgnored.bind(self) # ['.*','.git/**','.cache/**',fs.resolve('dist')],
				cwd: fs.cwd
			})

			#watcher.on('change') do(src,stats)
				src = normalize(src)
				history.mark(src,FLAGS.CHANGE) # with change / remove flags
				emit('change',src)
				emit('touch',src)

			#watcher.on('unlink') do(src,stats)
				src = normalize(src)
				history.mark(src,FLAGS.UNLINK)
				emit('unlink',src)
				emit('touch',src)

			#watcher.on('add') do(src,stats)
				src = normalize(src)
				console.log 'add',src
				history.mark(src,FLAGS.ADD)
				emit('add',src)
				emit('touch',src)

		return #watcher

	def isIgnored path
		return true if path.match(/(\/\.(git|imba-cache|cache)\/|\.DS_Store)/)
		return false

	def add ...paths
		let uniq = []
		for path in paths
			unless map[path]
				map[path] = yes
				uniq.push(path)

		if #watcher and uniq.length
			#watcher.add(...uniq)
		self

	def has path
		!!map[path]

	def sync target
		history.pull(target)

	def start
		instance
		return self
