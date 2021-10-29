import http from 'http'
import index from '__ENTRYPOINT__'

const server = http.createServer do(req,res)
	let body = index.body
	# potentially inject hmr script
	if process.env.IMBA_HMR or global.IMBA_HMR
		body = "<script src='/__hmr__.js'></script>" + body

	res.end body

imba.serve(server.listen(process.env.PORT || 3000),static: yes)