// Moves the entry files in changelog/ into a new section of changelog.md for the
// version in package.json, then deletes them. lerna runs this during the `version`
// lifecycle (after the bump, before commit). lerna commits only what is staged, so
// this script stages its own changes to put them in the Publish commit.
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const root = path.join(__dirname, '..')
const dir = path.join(root, 'changelog')
const file = path.join(root, 'changelog.md')
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))

const names = fs.readdirSync(dir).filter(name => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(name)).sort().reverse()
if (names.length == 0) process.exit(0)

// Continuation lines are indented so that later paragraphs stay inside the bullet.
const entries = names.map(name => '* ' + fs.readFileSync(path.join(dir, name), 'utf8').trim().replace(/\n(?=.)/g, '\n    '))

const changelog = fs.readFileSync(file, 'utf8')
const at = changelog.search(/^## /m)
fs.writeFileSync(file, changelog.slice(0, at) + `## ${version}\n\n${entries.join('\n\n')}\n\n` + changelog.slice(at))

for (const name of names) fs.unlinkSync(path.join(dir, name))
execFileSync('git', ['add', '--all', '--', 'changelog.md', 'changelog'], { cwd: root, stdio: 'inherit' })
