# Checks how the bundler cache (src/bundler/cache.imba) reads and writes its files.
# Run via `npm run test-bundler` (also part of CI).
import assert from 'node:assert'
import nfs from 'node:fs'
import np from 'node:path'
import os from 'node:os'
import Cache from '../../src/bundler/cache'

# The cache does not read its files when CI is set.
delete process.env.CI

let failed = 0

def check name, cb
	try
		await cb!
		console.log "ok - {name}"
	catch e
		failed++
		console.error "not ok - {name}"
		console.error "    {e.message}"

def tmpdir
	nfs.mkdtempSync(np.join(os.tmpdir!,'imba-cache-'))

def keypath dir, name
	let cache = new Cache(cachedir: dir)
	cache.fullKeyPath(cache.normalizeKey(name))

def main
	await check "a cache file with invalid JSON is compiled again, and memo returns the compiled value" do
		let name = '/src/invalid.imba:node'
		let dir = tmpdir!
		nfs.writeFileSync(keypath(dir,name),'{"js":')
		let cache = new Cache(cachedir: dir)
		let val = await cache.memo(name,1,do Promise.resolve({js: 'compiled'}))
		assert.deepEqual val, {js: 'compiled'}

	await check "a reader that opened a cache file before a write reads the complete previous value" do
		let name = '/src/rewrite.imba:node'
		let dir = tmpdir!
		let path = keypath(dir,name)
		let cache = new Cache(cachedir: dir)
		let key = cache.normalizeKey(name)
		await cache.setKeyValue(key,{js: 'old'})
		let fd = nfs.openSync(path,'r')
		await cache.setKeyValue(key,{js: 'new'})
		assert.equal nfs.readFileSync(fd,'utf8'), '{"js":"old"}'
		assert.equal nfs.readFileSync(path,'utf8'), '{"js":"new"}'
		nfs.closeSync(fd)

	process.exit(1) if failed

main!
