import Chokidar from 'chokidar'
import Component from './component'
import ChangeLog from './changes'

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

	get instance
		return #watcher if #watcher
		#watcher = Chokidar.watch([fs.cwd],{
			ignoreInitial: true,
			depth: 5,
			ignored: ['.*','.git/**','.cache/**',fs.resolve('dist')],
			cwd: fs.cwd
		}) 

		#watcher.on('change') do(src,stats)
			# console.log 'watcher on change',src
			history.mark(src,FLAGS.CHANGE) # with change / remove flags
			emit('change',src)
			emit('touch',src)
			# fs.touchFile(src)
			# #bundler..scheduleRebuild!

		#watcher.on('unlink') do(src,stats)
			history.mark(src,FLAGS.UNLINK)
			emit('unlink',src)
			emit('touch',src)
			yes
			# fs.removeFile(src)
			# #bundler..scheduleRebuild!

		#watcher.on('add') do(src,stats)
			console.log 'add',src
			history.mark(src,FLAGS.ADD)
			emit('add',src)
			emit('touch',src)

		return #watcher

	def add ...paths
		# console.log 'watch add!!',paths
		instance.add(...paths)
		self

	def sync target
		history.pull(target)

