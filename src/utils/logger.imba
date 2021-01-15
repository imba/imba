import {performance} from 'perf_hooks'

const ansiMap =
	reset: [0, 0],
	bold: [1, 22],
	dim: [2, 22],
	italic: [3, 23],
	underline: [4, 24],
	inverse: [7, 27],
	hidden: [8, 28],
	strikethrough: [9, 29]
	
	black: [30, 39],
	red: [31, 39],
	green: [32, 39],
	yellow: [33, 39],
	blue: [34, 39],
	magenta: [35, 39],
	cyan: [36, 39],
	white: [37, 39],
	gray: [90, 39],
	
	redBright: [91, 39],
	greenBright: [92, 39],
	yellowBright: [93, 39],
	blueBright: [94, 39],
	magentaBright: [95, 39],
	cyanBright: [96, 39],
	whiteBright: [97, 39]

const ansi =
	bold: do(text) '\u001b[1m' + text + '\u001b[22m'
	red: do(text) '\u001b[31m' + text + '\u001b[39m'
	green: do(text) '\u001b[32m' + text + '\u001b[39m'
	yellow: do(text) '\u001b[33m' + text + '\u001b[39m'
	blue: do(text) '\u001b[94m' + text + '\u001b[39m'
	gray: do(text) '\u001b[90m' + text + '\u001b[39m'
	white: do(text) '\u001b[37m' + text + '\u001b[39m'
	f: do(name,text)
		let pair = ansiMap[name]
		return '\u001b['+pair[0]+'m' + text + '\u001b['+pair[1]+'m'

ansi.warn = ansi.yellow
ansi.error = ansi.red

const notWin = process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color'

# import ora from 'ora'

const logSymbols = {
	info: ansi.f('yellowBright',notWin ? 'ℹ' : 'i')
	success: ansi.green(notWin ? '✔' : '√')
	warning: ansi.yellow(notWin ? '⚠' : '!!')
	error: ansi.red(notWin ? '×' : '✖')
	debug: ansi.blue(notWin ? 'ℹ' : 'i')
}

const logLevels = ['debug','info','success','warning','error','silent']

const addressTypeName = {
	"-1": "socket"
	"4": "ip4"
	"6": "ip6"
}

export def format str,...rest
	let fmt = ansi.f
	str = str.replace(/\%([\w\.]+)/g) do(m,f)
		let part = rest.shift!
		if f == 'kb'
			fmt 'dim', (part / 1000).toFixed(1) + 'kb'
		elif f == 'path' or f == 'bold'
			fmt('bold',part)
		elif f == 'dim'
			fmt('dim',part)
		elif f == 'address'
			let typ = addressTypeName[part.addressType]
			if part.port
				# what about the protocol?
				fmt('blueBright',[part.address or "http://127.0.0.1",part.port].join(':'))
			else
				fmt('blueBright',typ)
		elif f == 'ms'
			fmt('yellow',Math.round(part) + 'ms')
		elif f == 'd'
			fmt('blueBright',part)
		elif f == 'red'
			fmt('redBright',part)
		elif f == 'green'
			fmt('greenBright',part)
		elif f == 'yellow'
			fmt('yellowBright',part)
		elif f == 'ref'
			fmt('yellowBright','#' + (part.id or part))
		elif f == 'elapsed'
			rest.unshift(part) if part != undefined
			let elapsed = performance.now! # Date.now! - #ctime
			fmt('yellow',Math.round(elapsed) + 'ms')
		elif f == 'heap'
			rest.unshift(part) if part != undefined
			let used = process.memoryUsage!.heapUsed / 1024 / 1024
			fmt('yellow',used.toFixed(2) + 'mb')
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
		self.prefix = prefix ? format(...prefix)[0] : ''
		self.loglevel = loglevel or process.env.IMBA_LOGLEVEL or (global.#IMBA_OPTIONS and global.#IMBA_OPTIONS.loglevel) or 'info'

	def write kind,...parts
		if logLevels.indexOf(kind) < logLevels.indexOf(self.loglevel)
			return self

		let sym = logSymbols[kind] or kind
		let [str,...rest] = format(...parts)
		str = prefix + str if prefix

		if #spinner and #spinner.isSpinning
			# console.log 'set text on spinner!!!'
			if kind == 'success'
				#spinner.clear!
				console.log(sym + ' ' + str,...rest)
				#spinner.frame!

			#spinner.text = str
		else
			console.log(sym + ' ' + str,...rest)
	
	def debug ...pars do write('debug',...pars)
	def log ...pars do write('info',...pars)
	def info ...pars do write('info',...pars)
	def warn ...pars do write('warn',...pars)
	def error ...pars do write('error',...pars)
	def success ...pars do write('success',...pars)

	def ts ...pars do write('debug',...pars,performance.now!)

	def spinner
		return
		Spinner = ora('Loading').start!

	get #spinner
		Spinner

	get proxy
		let fn = do(...pars) info(...pars)
		fn.info = info.bind(self)
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
			info "{label} %ms",Date.now! - t
			return res

export default (new Logger).proxy