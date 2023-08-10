

		let imports = []
		body.replace(/^import [^\;]+\;/gm) do(m)
			let str = m.replace(/[\r\n]/g,'')
			let path = str.split('"')[1]
			imports.push([str.split('from')[0],path])
			''

		let idx = 0

		let mappings = #mappings = {}

		# find the declare const things
		body.replace(/^declare const (\Ω([^\Ω\s]+)\Ω\w+)_base:([^;]+);/gm) do(m,fullname,name,desc)
			console.log "replace!!",fullname,name
			let info = extractBlock(desc,imports)
			info.name ||= name
			mappings[fullname] = info
			# mappings[fullname + 'base'] = info

		while (idx = body.indexOf('class Ω',idx)) >= 0
			# add double closer
			let start = body.indexOf('\n',idx)
			let line = body.slice(idx,start)
			let name = line.split(' ')[1]
			let realname = name.split('Ω')[1]
			let end = body.indexOf('\n}',idx)
			let nested = body.slice(start,end)

			let m = line.match(/class (\Ω([^\Ω\s]+)(?:\Ω(\w+))?)\s(extends ([^\s]+)\s)?\{/ )
			let exists = !!mappings[name]

			if m and m[5] and !realname[0].match(/\w/)
				realname = m[5]

			# console.log "NESTED",nested
			let info = mappings[name] ||= {
				name: realname
			}

			unless exists
				# console.log 'could not find?!',name,realname
				let source = imports.find do $1[0].match(realname)
				if source
					info.ns ||= source[1]
			# #nested = nested
			# try
			# 	if let m = nested.match(/__extends__: (.*);+/)
			# 		# console.log 'match',m
			# 		if let ext = m[1].match(/typeof (?:import\("([^"]+)"\)\.)?([^;]+)/)
			# 			info.ns = ext[1]
			# 			info.name = ext[2]
			#
			# 			let source = imports.find do $1[0].match(ext[2])
			# 			if source
			# 				info.ns ||= source[1]
			# 		yes

			# extract the extends part
			body = body.slice(0,idx) + body.slice(idx).replace('\n}','\n}}')
			idx += 5

		# Should definitely parse as AST instead

		# find imports
		body = body.replace(/export class (\Ω([^\Ω\s]+)(?:\Ω(\w+))?)\s(extends ([^\s]+)\s)?\{/g) do(m,full,name,mod)
			# console.log 'replacing',m,mod,name

			# if mod == 'import'
			let mapping = mappings[full]

			unless mapping
				let info = mappings[full] ||= {
					name: name
				}

			if mapping
				return "interface    {full}" + ' {'
				# return "export class"

			if mapping..ns
				return "declare module \"{mapping.ns}\" \{\ninterface {mapping.name} \{"
			elif mapping..name
				return 'declare global {\ninterface ' + mapping.name + ' {'

			let reg = new RegExp(" {name}[, ]")
			let source = imports.find do $1[0].match(reg)
			# console.log 'found source?',source,reg
			if source
				return "declare module \"{source[1]}\" \{\ninterface {name} \{"
			# let path = body.replace()

			'declare global {\ninterface ' + name + ' {'

		# can we do this?

		# now replace the this types
		if false
			body = body.replace(/\Ω([\w\$]+)\Ω[\w\$]+/g,'this')
			body = body.replace(/\@this \{ this & \w+ \}/g,'')
			body = body.replace(/this & \w+/g,'this')

			# clean empty comments
		if true
			body = body.replace(/\/\*\*?[\r\n\t\s]*\*\//g,'')

			# clean all jsdoc related comments since they should
			# just be proxied to the real imba file
			body = body.replace(/\/\*\*[\S\s]+?\*\//gm, '')

			# replace extends field
			body = body.replace(/^[\t\s]+__extends__\:.+;/gm,'')

		body = body + '\nexport {}'

		for own fullname,info of mappings
			let code = "interface {info.name} extends {fullname} \{\}"
			if info.ns
				code = "declare module \"{info.ns}\" \{\n" + code + "\n\}"
			else
				code = "declare global \{\n" + code + "\n\}"

			body += '\n' + code