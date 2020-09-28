tag app-root
	css p,b,i,s fw:100
	css $p1 fw:200
	css $p2 fw:200

	css button fw:300 @focus:500

	css $b1
		fw:300 ..app@focus:600 .on:400 @focus:500
		
	css $b2
		fw:300 .on:400 @focus:500 ..app@focus:600
	
	css .btn
		fw:500
		
	css %btn
		fw:700

	css .i1 fw: 200
	css $i1 fw: 300
	css i fw: 100

	css $g1 fw:200
		b fw:300
		
	css b$gb1 fw:400
	css $gb2 fw:400

	def render
		<self.app>
			<button$b1> "300"
			<button$b2> "300"
			<button$b3[fw:400]> "400"
			<button$b4 %btn> "700"
			<button$b5[fw:200].btn %btn> "400"
			<button$b6.btn %btn> "700"
			<p$p0> "100"
			<p$p1> "200"
			<p$p2[fw:700]> "700"
			<p$p3[fw:700]> "700"

			<i$i1.i1> "I"
			
			<div$g1>
				<b> "300"
				<b$gb1> "400"
				<b$gb2> "300"


imba.mount(let app = <app-root tabIndex=0>)

test do
	eqcss app.$b1, 300
	app.$b1.flags.add('on')
	eqcss app.$b1, 400
	app.$b1.focus!
	eqcss app.$b1, 500

test 'inline precedence' do
	eqcss app.$b3, 400
	app.$b3.focus!
	eqcss app.$b3, 400

test 'inline precedence' do
	eqcss app.$b4, 700
	# app.$btn3.focus!
	# eqcss app.$btn3, fontWeight: '400'
test 'inline precedence' do
	eqcss app.$b5, 200
	
test 'inline precedence' do
	eqcss app.$b6, 700
	
test 'inline precedence' do	
	eqcss app.$p0, 100
	eqcss app.$p1, 200
	eqcss app.$p2, 700

# test media query precedence

tag A
	css $button fw:500

	<self>
		<button$button[fw:600]> "600"

tag B < A
	css $button fw:700

test '$sel == inline' do	
	eqcss <B>,700,0