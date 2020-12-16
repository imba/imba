import compiler from 'compiler'
import imba1 from 'compiler1'

import {parentPort, workerData} from 'worker_threads'

const id = Math.random!

parentPort.on 'message' do({code,type,options})
	let response = {id: options.sourceId}

	console.log 'compiler worker!!!',options.sourcePath,id

	if type == 'imba1'
		let res = imba1.compile(code,options)
		response.js = res.js
	elif type == 'imba'
		let res = compiler.compile(code,options)
		let js = res.js

		if res.css
			js += "\nimport 'styles:{options.sourcePath}'"

		response.js = js
		response.css = res.css
		
	parentPort.postMessage(response)