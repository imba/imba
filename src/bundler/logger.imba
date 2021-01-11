const helpers = require '../compiler/helpers'

const ansi = helpers.ansi
const notWin = process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color'

import ora from 'ora'

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
	let fmt = helpers.ansi.f
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
			let elapsed = Date.now! - #ctime
			fmt('yellow',Math.round(elapsed) + 'ms')
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
		self.loglevel = loglevel or (global.#IMBA_OPTIONS and global.#IMBA_OPTIONS.loglevel) or 'warning'

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

	def spinner
		return
		Spinner = ora('Loading').start!

	get #spinner
		Spinner

	def time label, cb
		let t = Date.now!
		if cb
			let res = await cb()
			info "{label} %ms",Date.now! - t
			return res
		