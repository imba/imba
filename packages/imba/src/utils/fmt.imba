import { fdir } from 'fdir'
import fs from 'fs'
import cp from 'child_process'
import np from 'path'
import 'imba/colors'

const E = do
	console.error String($1).red
	process.exit!

const devlog = /^\s*\bL\b.*$/
const extra-lines = /\n\n\n+/gm
const commented-log = /^\s*#\s+(console\.|L)\b.*\n/gm
const comment = /^\s*#/
const empty-comment = /^\s*#\s*\n/gm
const whitespace = /^\s*$/
const trailing-whitespace = /[ \t]+$/gm

def remove-devlogs contents, filename

	let result = []
	let lines = contents.split('\n')

	for line, i in lines

		unless devlog.test line
			result.push line
			continue

		let prev-line = result[-1]
		let next-line = lines[i + 1]

		let j = i - 1
		while typeof prev-line is 'string' and (whitespace.test(prev-line) or comment.test(prev-line))
			prev-line = lines[--j]

		j = i + 1
		while typeof next-line is 'string' and (whitespace.test(next-line) or comment.test(next-line))
			next-line = lines[++j]

		let pt = prev-line..match(/^\t*/)[0]
		let ct = line.match(/^\t*/)[0]
		let nt = next-line..match(/^\t*/)[0]

		continue if pt is ct or ct is nt

		result.push line

	result.join("\n")

export default def fmt args, opts

	unless opts.force
		try
			if cp.execSync("git status --porcelain", { stdio: "pipe" }).toString!
				E "Git working directory is not clean"
		catch e
			E "Failed to check git status"

	let files = new fdir!
		.glob("**/*.imba")
		.withFullPaths!
		.crawl(".")
		.sync!

	for filename\string of files
		# TODO create ignore flag instead of hardcoding fmt.imba
		continue if filename.endsWith 'fmt.imba'
		continue if filename.includes 'node_modules'

		let contents = fs.readFileSync filename, 'utf8'
		let prev = contents

		if args.length
			if args.includes 'devlogs'
				contents = remove-devlogs contents, filename

			if args.includes 'comments'
				contents = contents.replaceAll empty-comment, ''
				contents = contents.replaceAll commented-log, ''

			if args.includes 'empty-comments'
				contents = contents.replaceAll empty-comment, ''

			if args.includes 'commented-logs'
				contents = contents.replaceAll commented-log, ''

			if args.includes 'whitespace'
				contents = contents.replaceAll trailing-whitespace, ''
				contents = contents.replaceAll extra-lines, '\n\n'

			if args.includes 'trailing-whitespace'
				contents = contents.replaceAll trailing-whitespace, ''

			if args.includes 'extra-lines'
				contents = contents.replaceAll extra-lines, '\n\n'

		else
			contents = remove-devlogs contents, filename
			contents = contents.replaceAll empty-comment, ''
			contents = contents.replaceAll commented-log, ''
			contents = contents.replaceAll trailing-whitespace, ''
			contents = contents.replaceAll extra-lines, '\n\n'

		if args.includes('devlogs') or !args.length
			for line,i in contents.split('\n')
				if devlog.test line
					console.warn "Unable to remove devlog in {np.relative(process.cwd!,filename)}:{i+1}:{line.indexOf('L')+1} due to indent".yellow

		continue if prev is contents
		fs.writeFileSync filename, contents
