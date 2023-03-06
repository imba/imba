tag A
	<self> 'A'

tag B
	<self> <slot> <A.a>

tag C
	<self> <slot> <div>

test do
	imba.mount let app = <B>
	ok app.children[0].matches('.a')
	eq app.children[0].#parent,app
