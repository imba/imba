import fs from 'fs'
import path from 'path'
import http from 'http'
import index from './entry.html'

import {serve} from 'imba/src/imba/serve.imba'

const server = http.createServer do(req,res)
	let body = index.body
	if global.IMBA_HMR and body.indexOf('__hmr__.js') == -1
		body = "<script src='/__hmr__.js'  ></script>" + body
	res.end body

serve server.listen(process.env.PORT || 3000)
