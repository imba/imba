import './colors'
import {performance} from 'perf_hooks'

const notWin = process.platform isnt 'win32' or process.env.CI or process.env.TERM is 'xterm-256color'
const logSymbols =
	info: (notWin ? 'ℹ' : 'i').bright-yellow
	success: (notWin ? '✔' : '√').green
	warning: (notWin ? '⚠' : '!!').yellow
	error: (notWin ? '×' : '✖').red
	debug: (notWin ? 'ℹ' : 'i').blue

const addressTypeName =
	"-1": "socket"
	"4": "ip4"
	"6": "ip6"

const logLevels = [
	'debug'
	'info'
	'success'
	'warning'
	'error'
	'silent'
]

export def formatMarkdown str
	str.replace(/https?\:[^\s\n\)\]]+/g, do $1.bright-blue)
		.replace(/^[\t\s]*\>[^\n]+/gm, do $1.bold)
		.replace(/\t/g,'  ')
		.replace(/^/gm,'  ')

export def format str,...rest
	str = str.replace(/\%([\w\.]+)/g) do(m,f)
		let part = rest.shift!
		let s = String(part)

		if f is 'red'
			s.bright-red
		elif f is 'green'
			s.green
		elif f is 'magenta'
			s.bright-magenta
		elif f is 'cyan'
			s.bright-cyan
		elif f is 'dim'
			s.dim
		elif f is 'd'
			s.bright-blue
		elif f is 'yellow' or f is 'imba'
			s.bright-yellow
		elif f is 'path' or f is 'bold'
			s.bold
		elif f is 'ms'
			"{Math.round(part)}ms".yellow
		elif f is 'kb'
			"{(part / 1000).toFixed(1)}kb".dim
		elif f is 'ref'
			"#{part.id or part}".bright-yellow
		elif f is 'markdown'
			formatMarkdown(part)
		elif f is 'elapsed'
			rest.unshift(part) if part != undefined
			let elapsed = performance.now!
			"{Math.round(elapsed)}ms".yellow
		elif f is 'heap'
			rest.unshift(part) if part != undefined
			let used = process.memoryUsage!.heapUsed / 1024 / 1024
			"{used.toFixed(2)}mb".yellow
		elif f is 'address'
			if part.port
				# what about the protocol?
				[part.address or "http://localhost",part.port].join(':').bright-blue
			else
				String(addressTypeName[part.addressType]).bright-blue
		else
			part

	return [str,...rest]

let Spinner = null
let Instance = null

export class Logger

	static get main
		Instance ||= new self

	def constructor {prefix = null,loglevel} = {}
		#ctime = Date.now!
		self.prefix = prefix # ? format(*prefix)[0] : ''
		# FIXME Remove IMBA_OPTIONS?
		self.loglevel = loglevel or process.env.IMBA_LOGLEVEL or (global.#IMBA_OPTIONS and global.#IMBA_OPTIONS.loglevel) or 'info'

	set prefix val
		#prefix = val ? format(*val)[0] : ''

	get prefix
		#prefix

	def write kind,...parts
		if logLevels.indexOf(kind) < logLevels.indexOf(self.loglevel)
			return self

		return console.log! unless parts.length

		let sym = logSymbols[kind] or kind
		let [str,*rest] = format(*parts)
		str = prefix + str if prefix

		if #spinner and #spinner.isSpinning
			if kind == 'success'
				#spinner.clear!
				console.log(sym + ' ' + str,*rest)
				#spinner.frame!

			#spinner.text = str
		else
			console.log(sym + ' ' + str,*rest)

	def log
		let [str,*rest] = format(*arguments)
		console.log(str,*rest)

	def debug do write('debug',*arguments)
	def info do write('info',*arguments)
	# use "warning" to match logLevels and logSymbols
	def warn do write('warning',*arguments)
	def error do write('error',*arguments)
	def success do write('success',*arguments)

	def ts
		let now = performance.now!
		let diff = #last ? (now - #last) : 0
		write('debug',*arguments,"+{diff.toFixed(1)}ms".blue)
		#last = now

	def spinner
		return
		Spinner = ora('Loading').start!

	get #spinner
		Spinner

	get proxy
		let fn = info
		fn.info = info.bind(self)
		fn.log = log.bind(self)
		fn.warn = warn.bind(self)
		fn.error = error.bind(self)
		fn.debug = debug.bind(self)
		fn.success = success.bind(self)
		fn.ts = ts.bind(self)
		fn.logger = self
		return fn

	def time label, cb
		let t = Date.now!
		if cb
			let res = await cb()
			info "{label} %ms", Date.now! - t
			return res

export default (new Logger).proxy
