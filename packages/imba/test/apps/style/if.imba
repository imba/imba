tag App
	base = 250
	val = null

	<self>
		css fw:300
			$fw:{base}
			div fw:500
			span fw:$fw
			section fw:inherit

		if data
			css fw:600
				div fw:700

		if val
			css fw:{val}
				$fw:{val}
				div fw:{val + 1}
			if val > 600
				css
					span fw:100
					section fw:{val + 20}

			else
				css section fw:{val - 20}

		<div>
		<span>
		<section>
			if val == 100
				css fw:150

let app = imba.mount <App>

def check data, val, a,b,c,d
	app.data = data
	app.val = val
	app.render!
	eqcss app,a
	eqcss app,b,'div'
	eqcss app,c,'span'
	eqcss app,d,'section'

test do
	check(null,null,300,500,250,300)

test do
	# return
	# with data
	check({},null,600,700,250,600)

test do
	# without data again
	check(null,null,300,500,250,300)

test do
	# with custom value
	check(null,350,350,351,350,330)

test do
	# without anything again
	check(null,null,300,500,250,300)

test do
	# with val over 600
	check(null,601,601,602,100,621)

test do
	# with val at 100
	check(null,100,100,101,100,150)