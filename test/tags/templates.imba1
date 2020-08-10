extern describe, test, ok, eq, it

tag xul < ul
tag xno

tag wraps

	def render
		<self>
			# <div>
			# <h2> "content of template:"
			template

AA = [1,2,3,4,5]
TT = <div ->
	<ul.x>
		<li> "Hello"
		<li> Date.now
		<li>
			<xul ->
				<li> "Inner"
				<li> Date.now
			<xno -> <self data-stamp=Date.now>
				<li> "Inner"
				<li> Date.now
				for item,i in AA
					<li> item
			<wraps ->
				<div> "This is inside {Date.now}"
				for item,i in AA
					<div> item
	<span>

tag hello

	def render
		<self>
			<div>
				<h2> "content of template:"
				<div> "This is inside {Date.now}"
				for item,i in AA
					<div> item

HE = <hello>
document:body.appendChild(TT.dom)
document:body.appendChild(HE.dom)