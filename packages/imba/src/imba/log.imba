

export def logFormatter params, scope
	return if scope..debug? == no
	let out = []
	let fmts = []
	for param,i in params when i % 2 == 0
		let val = params[i + 1]

		# this is for node
		if param == ''
			if $web$
				fmts.push '%o'
				out.push val

			else
				fmts.push "%s"
				let pre = '\x1b[40m\x1b[32m'
				out.push "{pre}{val}\x1b[0m"
		else
			if $web$
				fmts.push '%c%s%c %o'
				out.push "background-color:#4c73e8;color:white",param,"background-color:none;color:initial"
				out.push val
			else
				fmts.push "%s %O"
				out.push "\x1b[44m\x1b[97m{param}\x1b[0m"
				out.push val

	return [fmts.join(' '),...out]

# let instance = global.imba ||= {}
let l = Symbol.for('#L')

export def use_devlog
	global[l] ||= global[l] or logFormatter
	# global.imba.uses_devlog = yes
	yes


	