###

When using L some,args,here - imba will include the literal names of each
logged parameter together with the value. Ie

	let mynum = 1
	L mynum

Will log out as "mynum",1 in the console.
In addition, the logger will look for a #L function on the current scope.
If one is found, it will send the arguments etc through this method before
logging out. This way you can add details, timestamps etc. If #L returns null,
the console.log will not happen.

You can use imba.logFormatter to use the default formatting / coloring in
combination with defining #L. The params is an array, with alternating label and value pairs.

L mynum,[1,2,3,mynum]
# params will be ['mynum',1,'[1,2,3,mynum]',[1,2,3,1]]
# If the label is '', only the value will be included

class Model
	id = 'modelid'
	def #L params, scope
		# adding model params to scope
		params.unshift(`model`,id)
		return imba.logFormatter(params,scope)

	def save props
		# Any L logging inside here will be routed through #L
		L 'saving',props

# model.save(a: 1) will now log:
# 'model',id,'props',{a: 1}

###

export def logFormatter params, scope
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
	yes


	