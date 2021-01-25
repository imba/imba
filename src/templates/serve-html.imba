import http from 'http'
import index from '__ENTRYPOINT__'

const server = http.createServer do(req,res)
	res.end index.body

imba.serve server.listen(process.env.PORT || 3000)