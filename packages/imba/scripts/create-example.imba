import fs from 'fs'
import np from 'path'

let name = process.argv[2]

unless name
	console.log "Supply a name: npm run create-example [name]"
	process.exit!

let dir = np.resolve("test/examples/{name}")
console.log process.argv,dir

def add name, contents
	let src = np.resolve(dir,name)
	fs.writeFileSync(src,contents)
	

fs.mkdirSync(dir,recursive:true)
add('index.imba','console.log "example"')
add('readme.md','Run `imba serve index.imba` in this directory')
add('package.json','{}')

# const cmd = "npm dist-tag add imba@{version} latest"

