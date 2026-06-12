// Smoke tests for the imbac CLI — exit codes and stdout/stderr separation.
// Run via `npm run test-cli` (also part of CI).
import { spawnSync } from 'child_process'
import assert from 'assert'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imbac = path.resolve(__dirname, '..', '..', 'bin', 'imbac')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'imbac-cli-'))

const invalidSrc = 'if true\n\t yes\n\tyes\n' // inconsistent indentation
const validSrc = 'console.log "hello"\n'

const invalidPath = path.join(tmp, 'invalid.imba')
const validPath = path.join(tmp, 'valid.imba')
fs.writeFileSync(invalidPath, invalidSrc)
fs.writeFileSync(validPath, validSrc)

function run(args, opts = {}) {
	return spawnSync(process.execPath, [imbac, ...args], { encoding: 'utf8', ...opts })
}

let failed = 0
function test(name, fn) {
	try {
		fn()
		console.log('ok - ' + name)
	} catch (e) {
		failed++
		console.error('not ok - ' + name)
		console.error('    ' + e.message)
	}
}

test('print mode: compile error exits non-zero, reports to stderr', () => {
	const res = run(['-p', invalidPath])
	assert.notStrictEqual(res.status, 0, 'expected non-zero exit code')
	assert.match(res.stderr, /error/i, 'expected error on stderr, got: ' + JSON.stringify(res.stderr))
	assert.match(res.stderr, /indentation/i)
	assert.strictEqual(res.stdout, '', 'expected no js on stdout')
})

test('output mode: compile error exits non-zero, reports to stderr, writes no file', () => {
	const outdir = path.join(tmp, 'out-invalid')
	const res = run(['-o', outdir, invalidPath])
	assert.notStrictEqual(res.status, 0, 'expected non-zero exit code')
	assert.match(res.stderr, /error/i, 'expected error on stderr, got: ' + JSON.stringify(res.stderr))
	assert.ok(!fs.existsSync(path.join(outdir, 'invalid.js')), 'expected no output file')
})

test('stdio mode: compile error exits non-zero, reports to stderr', () => {
	const res = run(['-s'], { input: invalidSrc })
	assert.notStrictEqual(res.status, 0, 'expected non-zero exit code')
	assert.match(res.stderr, /error/i, 'expected error on stderr, got: ' + JSON.stringify(res.stderr))
})

test('print mode: valid file exits 0 with js on stdout only', () => {
	const res = run(['-p', validPath])
	assert.strictEqual(res.status, 0, 'expected exit 0, stderr: ' + res.stderr)
	assert.match(res.stdout, /hello/, 'expected compiled js on stdout')
	assert.strictEqual(res.stderr, '', 'expected empty stderr')
})

test('stdio mode: valid input exits 0 with js on stdout', () => {
	const res = run(['-s'], { input: validSrc })
	assert.strictEqual(res.status, 0, 'expected exit 0, stderr: ' + res.stderr)
	assert.match(res.stdout, /hello/, 'expected compiled js on stdout')
})

test('output mode: valid file exits 0 and writes output', () => {
	const outdir = path.join(tmp, 'out-valid')
	const res = run(['-o', outdir, validPath])
	assert.strictEqual(res.status, 0, 'expected exit 0, stderr: ' + res.stderr)
	assert.ok(fs.existsSync(path.join(outdir, 'valid.js')), 'expected output file')
})

fs.rmSync(tmp, { recursive: true, force: true })

if (failed) {
	console.error(failed + ' test(s) failed')
	process.exit(1)
}
console.log('all cli tests passed')
