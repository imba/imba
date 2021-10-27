const options = {
	outdir: yes
	pubdir: yes
	force: yes
	sourcemap: yes
	clean: yes
	watch: yes
}

const configs = {
	target: yes
	external: yes
	format: yes
	'sources-content': yes
}

const aliases = {
	M: {minify: false}
	m: {minify: true}
	S: {sourcemap: false}
	s: {sourcemap: true}
	H: {hashing: false}
	h: {hashing: true}
	w: {watch: true}
	o: 'outdir'
	p: 'pubdir'
	f: 'force'
	
}

export def parse args

	let o = {
		entries: []
		overrides: {}
	}
	console.log 'parsing',args
	
	for item in args
		let val = null
		if item.indexOf('=') > 0
			val = item.slice(item.indexOf('=') + 1)

		if let m = item.match(/^-\w+$/)
			for arg of item.slice(1)
				let alias = aliases[arg]
				if typeof alias == 'string'
					item = "--{alias}"

				elif alias
					Object.assign(o,aliases[arg])
		
		if m = item.match(/^--(\w[\w\.\-]*)/)
			let path = m[1].split('.')
			console.log 'matched',m,path

	return o

let tests = {
	'-mM': {minify: false}
	'-mSH --node.sourcemap=node123': {}
	'-mHS -o=dist -p=.': {}
}

parse

for own parts,expected of tests
	let args = parts.split(' ')
	console.log parts, parse(args)

# parse(process.argv)