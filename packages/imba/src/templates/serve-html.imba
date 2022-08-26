import http from 'http'
import index from '__ENTRYPOINT__'
import {serve} from 'imba/src/imba/serve.imba'

const server = http.createServer do(req,res)
	let body = index.body
	# potentially inject hmr script
	if global.IMBA_HMR and body.indexOf('__hmr__.js') == -1
		body = "<script src='/__hmr__.js'  ></script>" + body
	res.writeHead(200,{'Content-Type': 'text/html'})
	res.end body


serve( server.listen(Number(process.env.PORT || 3000)) )