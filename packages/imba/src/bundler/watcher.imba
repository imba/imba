import Component from './component'
import ChangeLog from './changes'
import np from 'path'
import nfs from 'fs'
$node$ import chokidar from 'chokidar'

const FLAGS = {
	CHANGE: 1
	ADD: 2
	UNLINK: 4
}

# Never hold build inputs, and churn out events (git index writes, caches)
# that would only grow the change log.
const DEFAULT_IGNORE = ['.git','.imba-cache','.cache','.DS_Store']

# One regex per gitignore-style pattern, tested against a posix path relative
# to the project. A pattern without a slash matches a segment at any depth
# (`logs` hides logs/ wherever it sits); one with a slash is anchored to the
# project root (`app/tests/.bundle`). `*`, `?` and `**` work as in gitignore.
def compilePattern pattern
	let raw = String(pattern).replace(/\/+$/,'')
	let anchored = raw.indexOf('/') >= 0
	raw = raw.replace(/^\/+/,'')
	let body = raw.replace(/[^\w\/\*\?\-]/g,'\\$&')
	body = body.replace(/\*\*/g,'').replace(/\*/g,'[^/]*').replace(/\?/g,'[^/]').replace(//g,'.*')
	new RegExp(anchored ? "^{body}(/|$)" : "(^|/){body}(/|$)")

export default class Watcher < Component

	def constructor fs
		super()
		fs = fs
		history = new ChangeLog withFlags: yes
		events = []
		map = {}
		roots = new Map
		# FSEvents (macOS) and ReadDirectoryChangesW (Windows) cover a whole tree
		# through one handle. chokidar has no such backend since v4: it opens one
		# fs.watch per file, which on macOS is one kqueue descriptor per file. A
		# large project passes OPEN_MAX (10240) that way, after which posix_spawn
		# refuses every reload with EBADF. Linux inotify is cheap per directory,
		# so chokidar stays the backend there.
		native = (process.platform == 'darwin' or process.platform == 'win32') and process.env.IMBA_WATCHER != 'chokidar'
		let custom = fs.program..config..watch..ignore or []
		patterns = DEFAULT_IGNORE.concat(custom).map(compilePattern)
		let out = fs.program..outdir
		if out and !np.relative(fs.cwd,out).startsWith('..')
			#outdir = relative(out)
		map[fs.cwd] = 1

	def relative abs
		np.relative(fs.cwd,abs).split(np.sep).join('/')

	def isIgnored rel
		return no if rel == ''
		return yes if #outdir and (rel == #outdir or rel.startsWith(#outdir + '/'))
		for re in patterns
			return yes if re.test(rel)
		return no

	def onEvent root, type, name
		return unless name
		let abs = np.join(root,name)
		let rel = relative(abs)
		return if isIgnored(rel)
		let flag = FLAGS.CHANGE
		if type == 'rename'
			flag = nfs.existsSync(abs) ? FLAGS.ADD : FLAGS.UNLINK
		history.mark(rel,flag)
		emit(flag == FLAGS.CHANGE ? 'change' : (flag == FLAGS.ADD ? 'add' : 'unlink'),rel)
		emit('touch',rel)

	def watchRoot dir
		return if roots.has(dir)
		let nested = []
		for other of roots.keys!
			return if dir.startsWith(other + np.sep)
			nested.push(other) if other.startsWith(dir + np.sep)
		let w = null
		try
			let handler = do(type,name) onEvent(dir,type,name)
			w = nfs.watch(dir,{recursive: yes, persistent: yes},handler)
		catch e
			log.warn "could not watch {dir}: {e.message}"
			return
		w.on('error') do(e) log.warn "watcher error in {dir}: {e.message}"
		for other in nested
			roots.get(other).close!
			roots.delete(other)
		roots.set(dir,w)
		log.debug "watching {dir}"

	# The root to watch for an input outside the project: the package that owns
	# the outermost node_modules on the path, else the nearest package root - so
	# a linked package and its hoisted dependencies share one tree watch.
	def rootFor abs
		let dir = abs
		try
			dir = np.dirname(dir) unless nfs.statSync(dir).isDirectory!
		catch e
			dir = np.dirname(dir)
		let parts = dir.split(np.sep)
		let nm = parts.indexOf('node_modules')
		if nm > 0
			return parts.slice(0,nm).join(np.sep)
		let cur = dir
		while yes
			return cur if nfs.existsSync(np.join(cur,'package.json'))
			let up = np.dirname(cur)
			return dir if up == cur
			cur = up
		return dir

	def ensureRoot abs
		return if abs == fs.cwd or abs.startsWith(fs.cwd + np.sep)
		watchRoot(rootFor(abs))

	# chokidar backend
	get instance
		return #watcher if #watcher
		if $node$
			let normalize = do(src) src.split(np.sep).join(np.posix.sep)
			let ignored = do(path) isIgnored(relative(np.resolve(fs.cwd,path)))
			#watcher = chokidar.watch(Object.keys(map),{
				ignoreInitial: true,
				depth: 1,
				ignored: ignored
				cwd: fs.cwd
			})

			#watcher.on('change') do(src,stats)
				src = normalize(src)
				history.mark(src,FLAGS.CHANGE)
				emit('change',src)
				emit('touch',src)

			#watcher.on('unlink') do(src,stats)
				src = normalize(src)
				history.mark(src,FLAGS.UNLINK)
				emit('unlink',src)
				emit('touch',src)

			#watcher.on('add') do(src,stats)
				src = normalize(src)
				history.mark(src,FLAGS.ADD)
				emit('add',src)
				emit('touch',src)

		return #watcher

	def add ...paths
		let uniq = []
		for path in paths
			let abs = np.resolve(fs.cwd,path)
			continue if map[abs]
			map[abs] = yes
			uniq.push(abs)
			ensureRoot(abs) if native and #started
		if !native and #watcher and uniq.length
			#watcher.add(uniq)
		self

	def unwatch path
		let abs = np.resolve(fs.cwd,path)
		return self unless map[abs]
		delete map[abs]
		#watcher.unwatch(abs) if !native and #watcher
		self

	def close
		for w of roots.values!
			w.close!
		roots.clear!
		#watcher.close! if #watcher
		self

	def has path
		!!map[np.resolve(fs.cwd,path)]

	def sync target
		history.pull(target)

	def start
		return self if #started
		#started = yes
		if native
			watchRoot(fs.cwd)
			for own abs,v of map
				ensureRoot(abs)
			# no tree watch on the project itself: fall back to chokidar
			unless roots.has(fs.cwd)
				native = no
				instance
		else
			instance
		return self
