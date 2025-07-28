import * as util from './util'
import np from 'path'

import {Position,Range} from 'imba-monarch'

const imbac = require '../../imba/compiler.imba'

const ImbaOptions = {
	target: 'tsc'
	platform: 'tsc'
	imbaPath: null
	silent: yes
	noAnyTypes: yes
	sourcemap: 'hidden'
}

export class Compilation

	declare fileName\string

	# original imba code to compile
	declare body\string

	def constructor script, snapshot
		script = script
		fileName = script.fileName
		input = snapshot
		body = snapshot.getText(0,snapshot.getLength!)
		done = no
		o2iCache = {}
		diagnostics = []

		# i2o - input (frozen/old doc) to output conversion
		# d2o - live doc to frozen output
		# d2i - live doc to frozen input
		# o2d - frozen output to live doc
		
		options = {...ImbaOptions, fileName: fileName, sourcePath: fileName, sourceId: script.im.nr.toString(32)}

		if fileName.includes('node_modules/imba/src/imba')
			options.nocheck = true

	def getCompiler
		if !global.ils
			return imbac
		return global.ils.getImbaCompilerForPath(fileName) or imbac

	def dtext start, end
		script.im.getText(start,end)

	def itext start, end
		body.slice(start,end)

	def otext start, end
		js.slice(start,end)

	###
	Convert from position in compiled ts back to input at time of compilation
	###
	def o2iRange start\number, end\number, fuzzy = yes, tstext = null
		# the whole body of the file
		if start == 0 and end == js.length
			return [0,body.length]
			# return doc.rangeAt(0,ibody.length)

		let istart = null
		let iend = null

		for [ts0,ts1,imba0,imba1] in locs.spans
			if start == ts0
				istart = imba0

			if ts0 == end
				iend = imba0

			if end == ts1
				iend = imba1

			if start == ts0 and end == ts1
				return [imba0,imba1]
				# return doc.rangeAt(imba0,imba1)

		if istart != null and iend != null
			return [istart,iend]

		if fuzzy
			# let text = otext(start,end)
			# look for the text

			let i0 = o2i(start)
			let i1 = o2i(end)
			return [i0,i1]
			# return doc.rangeAt(i0,i1)

		# if we found no direct match and the tstext ends with a semicolon
		# try to rerun a shorter version
		if tstext and tstext[-1] == ';'
			return o2iRange(start,end - 1,fuzzy,tstext.slice(0,-1))
		
		return []

	def o2dRange start, end, fuzzy = yes
		let range = o2iRange(start,end,fuzzy)
		return i2d(range)

	def o2i o, opts = yes
		if o.start != undefined
			let start = Number(o.start)
			let end = start + Number(o.length)
			return o2iRange(start,end,opts)

		if o2iCache[o] != null
			return o2iCache[o]

		let val = null

		for [ts0,ts1,imba0,imba1] in locs.spans
			if o == ts0
				break val = imba0
			elif o == ts1
				break val = imba1

		if val !== null
			return o2iCache[o] = val

		let spans = locs.spans.filter do(pair)
			o >= pair[0] and pair[1] >= o

		if let span = spans[0]
			let into = (o - span[0]) / (span[1] - span[0])
			let offset = Math.floor(into * (span[3] - span[2]))
			if span[0] == o
				val = span[2]
			elif span[1] == o
				val = span[3]
			else
				val = span[2] + offset

		return  val

	def d2i d
		input.cache.rewindOffset(d,input.version)

	def i2d i
		return null if i == null
		if typeof i[0] == 'number'
			return [i2d(i[0]),i2d(i[1])]
		elif i isa Array
			return []

		input.cache.forwardOffset(i,input.version)

	def d2o d
		i2o(d2i(d))

	def o2d o, fuzzy = yes
		i2d(o2i(o,fuzzy))

	def i2oRange start, end, fuzzy = yes
		# the whole body of the file
		if start == 0 and end == body.length
			return [0,js.length]

		for [ts0,ts1,imba0,imba1] in locs.spans
			if start == imba0 and end == imba1
				return [ts0,ts1]

		if fuzzy
			let o0 = i2o(start)
			let o1 = i2o(end)
			return [o0,o1]

		return []

	def i2o i, opts = yes
		return null if i == null

		if i.start != undefined
			let start = Number(i.start)
			let end = start + Number(i.length)
			return i2oRange(start,end,opts)

		let matches = []
		let bestMatch = null

		let jscode = js or ''
		let imbacode = body or ''

		for [ts0,ts1,imba0,imba1],idx in locs.spans
			if i == imba0
				return ts0
			if i == imba1
				return ts1

			if imba1 > i > imba0
				let tsl = ts1 - ts0
				let isl = imba1 - imba0
				let o = i - imba0

				matches.push([tsl,isl,locs.spans[idx],jscode.slice(ts0,ts1),imbacode.slice(imba0,imba1)])

				# if isl == tsl
				#	matches.push([ts0 + o,tsl])

		if matches.length
			# sort and prioritize the shortest matches first
			# matches = matches.sort do $1[0] - $2[0]
			matches = matches.sort do Math.abs($1[0] - $1[1]) - Math.abs($2[0] - $2[1])

			if matches.length > 1
				util.log("multiple matches",matches,i)

			let chr = body[i - 1]

			for [tsl,isl,[ts0,ts1,imba0,imba1],tstr,istr] in matches
				# let tstr = js.slice(ts0,ts1)
				# let istr = body.slice(imba0,imba1)
				let ipre = istr.slice(0,i - imba0)

				if isl == tsl
					return ts0 + (i - imba0)

				let idx = tstr.indexOf(ipre)
				if idx >= 0
					return ts0 + idx + ipre.length

				if tstr.slice(-7) == '$$TAG$$'
					return ts0 + idx + ipre.length

				let into = (i - imba0) / (imba1 - imba0)
				return ts0 + Math.floor(into * (ts1 - ts0))

				# if chr == '\t' or chr == '\n' and ipre.match(/[\n\t]/)

		return null

	def inspectLocs i = null
		let out = []
		for [ts0,ts1,imba0,imba1],idx in locs.spans
			continue if ts0 == undefined
			if i != null and imba0 > i or i > imba1
				continue

			let tstr = js.slice(ts0,ts1)
			let istr = body.slice(imba0,imba1)
			let ipre = i != null ? istr.slice(0,i - imba0) : ''
			out.push([ts0,ts1,imba0,imba1,tstr,istr,ipre])
		return out

	# Not used now
	def compileAsync
		#compiling ||= new Promise do(resolve)
			ioptions.sourceId = "aa"
			let res
			let t = Date.now!
			if file.isLegacy
				res = await workers.compile_imba1(ibody,ioptions)
			else
				res = await workers.compile_imba(ibody,ioptions)

			self.result = res
			resolve(self)

	set result res
		#result = res
		done = yes
		if res.js
			self.js = res.js
			self.locs = res.locs
		diagnostics = res.diagnostics
		yes

	get result
		#result

	def compile
		return self if done

		try
			done = yes
			let t0 = started = Date.now!
			let compiler = getCompiler!
			let res = compiler.compile(body,options)
			
			if res..js
				self.js = res.js
				self.locs = res.locs

			self.diagnostics = res.diagnostics
			# delete self.result.rawResult # not needed - takes memory
			#compiling = Promise.resolve(self)
			L("compiled {fileName} in {Date.now! - t0}ms")
		catch e
			util.log 'compiler crashed',script.fileName,e
			
			self.diagnostics = {diagnostics: []}
			yes
		finally
			ended = Date.now!
			took = ended - started

		return self

export default new class Compiler

	cache = {}

	def lookup src, body
		# is this used?
		if cache[body]
			return cache[body]

	def compile script, body
		(new Compilation(script,script.fileName,body)).compile!

	def readFile src, body
		if cache[body]
			return cache[body].js
		# never reached?
		let doc = cache[body] = new Compilation(null,src,body)
		doc.compile!
		util.log('readFile')

		return doc.js or "\n"