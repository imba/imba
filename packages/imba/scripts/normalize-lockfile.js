// lerna's `version` step rewrites package-lock.json via @nx/devkit's writeJsonFile,
// which omits the trailing newline that `npm install` always writes. Without this,
// a fresh clone + `npm install` would produce a spurious one-line dirty lockfile.
// lerna runs this during the `version` lifecycle (after the bump, before commit),
// so the normalized file lands in the Publish commit. Idempotent: ensures exactly
// one trailing newline, so it's a no-op once lerna/npm agree.
const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'package-lock.json')
if (!fs.existsSync(file)) process.exit(0)

const normalized = fs.readFileSync(file, 'utf8').replace(/\n*$/, '') + '\n'
fs.writeFileSync(file, normalized)
