export def dashToCamelCase str
	str = String(str)
	if str.indexOf('-') >= 0
		# should add shortcut out
		str = str.replace(/([\-\s])(\w)/g) do |m,v,l| l.toUpperCase()
	return str

export def parseArgs argv, o = {}
	var aliases = o.alias ||= {}
	var groups  = o.group ||= []
	var schema  = o.schema || {}

	schema.main = {}

	var options = {}
	var explicit = {}
	argv = argv || process.argv.slice(2)
	var curr = null
	var i = 0
	var m

	while(i < argv.length)
		var arg = argv[i]
		i++

		if m = arg.match(/^\-([a-zA-Z]+)(\=\S+)?$/)
			curr = null
			let chars = m[1].split('')

			for item,i in chars
				# console.log "parsing {item} at {i}",aliases
				var key = aliases[item] or item
				chars[i] = key
				options[key] = yes

			if chars.length == 1
				curr = chars

			continue

		elif m = arg.match(/^\-\-([a-z0-9\-\_A-Z]+)(\=\S+)?$/)
			var val = true
			var key = m[1]

			if key.indexOf('no-') == 0
				key = key.substr(3)
				val = false

			key = dashToCamelCase(key)

			if m[2]
				val = m[2].slice(1)

			options[key] = val
			curr = key
			continue

		else
			var desc = schema[curr]

			unless curr and schema[curr]
				curr = 'main'

			if arg.match(/^\d+$/)
				arg = parseInt(arg)

			var val = options[curr]
			if val == true or val == false
				options[curr] = arg
			elif val isa String or val isa Number
				options[curr] = [val].concat(arg)
			elif val isa Array
				val.push(arg)
			else
				options[curr] = arg
			
			unless desc and desc.multi
				curr = 'main'

	for group in groups
		let name = dashToCamelCase(group)
		for own k,v of options
			if k.indexOf(name) == 0
				let key = k.substr(name.length).replace(/^\w/) do |m| m.toLowerCase()
				if key
					options[name] ||= {}
					options[name][key] = v
				else
					options[name] ||= {}

	if options.env isa String
		options["ENV_{options.env}"] = yes

	return options


export def printErrorInDocument
	var div = document.createElement('div')
	div.innerHTML = `
	<h2>Error in ERROR_FILE</h2>
	`
	var pre = document.createElement('pre')
	pre.innerText = `ERROR_SNIPPET`
	div.appendChild(pre)
	window.addEventListener('load') do
		window.document.body.appendChild(div)
