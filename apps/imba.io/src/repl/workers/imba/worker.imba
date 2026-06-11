const imbac = require 'imba/compiler'

import {ImbaDocument} from 'imba/program'

# this should talk to the languageservice
class ImbaWorker

	ctx

	constructor ctx, options
		ctx = ctx
		options = options
		models = {}
		documents = {}

	def getModel uri
		for item in ctx.getMirrorModels!
			if item.uri.toString! === uri
				return item
		return null

	def getDocument uri
		let model = getModel(uri)
		let body = model.getValue!
		let doc = documents[uri] ||= new ImbaDocument(uri,'imba',0,body)
		doc.overwrite(body) unless doc.content == body
		return doc

	def getSemanticTokens uri
		let doc = getDocument(uri)

		return doc.getEncodedSemanticTokens!
		# console.log 'get semantic tokens',uri,doc,getModel(uri),tokens
		# let results = tokens.map do [$1.offset,$1.value.length]
		# return results

	def getDiagnostics uri
		let model = getModel(uri)
		let code = model.getValue!
		return Promise.resolve({}) unless (/\S/).test(code)

		let out = {errors: []}

		try
			let res = imbac.compile(code,{sourcePath: uri})
			# console.log 'did compile',res
			out.js = res.js
			return Promise.resolve(out)
		catch e
			let token = e.token
			console.log 'error on get diagnostics',e,token
			out.errors.push([token._loc,token._len,e.message])
			return Promise.resolve(out)

	def getCompiledCode uri
		let model = getModel(uri)
		let code = model.getValue
		
		if (/\S/).test(code)
			let out = imbac.compile(code,{})
			return Promise.resolve(String(out))
		else
			return Promise.resolve({})

# export def create ctx, data
#	console.log 'creating worker!'
#	return new ImbaWorker(ctx, data)

global.define do
	return {
		create: do(ctx,data) return new ImbaWorker(ctx, data)
	}