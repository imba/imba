const helpers = require '../compiler/helpers'

const ansi = helpers.ansi
const notWin = process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color'

const logSymbols = {
	info: ansi.blue(notWin ? 'ℹ' : 'i')
	success: ansi.green(notWin ? '✔' : '√')
	warning: ansi.yellow(notWin ? '⚠' : '!!')
	error: ansi.red(notWin ? '×' : '✖')
}

export class Logger
	def constructor owner = null
		#ctime = Date.now!

	def write kind,str,...rest
		let sym = logSymbols[kind] or kind
		let fmt = helpers.ansi.f
		str = str.replace(/\%([\w\.]+)/g) do(m,f)
			let part = rest.shift!
			if f == 'kb'
				fmt 'dim', (part / 1000).toFixed(1) + 'kb'
			elif f == 'path'
				fmt('bold',part)
			elif f == 'ms'
				fmt('yellow',Math.round(part) + 'ms')
			elif f == 'd'
				fmt('blueBright',part)
			elif f == 'red'
				fmt('redBright',part)
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

		console.log(sym + ' ' + str,...rest)
	
	def debug ...pars do write('info',...pars)
	def log ...pars do write('info',...pars)
	def info ...pars do write('info',...pars)
	def warn ...pars do write('warn',...pars)
	def error ...pars do write('error',...pars)
	def success ...pars do write('success',...pars)


	def time label, cb
		let t = Date.now!
		if cb
			let res = await cb()
			info "{label} %ms",Date.now! - t
			return res
		