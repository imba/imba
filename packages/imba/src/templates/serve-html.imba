import http from 'http'
import index from '__ENTRYPOINT__'
import {serve} from 'imba/src/imba/serve.imba'

const server = http.createServer do(req,res)
	let body = index.body
	# potentially inject hmr script
	if (process.env.IMBA_HMR or global.IMBA_HMR) and body.indexOf('__hmr__.js') == -1
		body = "<script src='/__hmr__.js'  ></script>" + body

	res.end body

serve(server.listen(process.env.PORT || 3000))