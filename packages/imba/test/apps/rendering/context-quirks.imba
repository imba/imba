# SKIP

def any item
	<span.null> 'null'

tag app-test
	def build
		$iframe = <iframe[pos:absolute width:100% height:100% min-width:200px]>

tag A
	def log str
		let item = <div> any(str)
		appendChild(item)

test do
	let a = <A>
	a.log 'hello'
	eq imba.ctx,null