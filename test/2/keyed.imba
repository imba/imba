var items = ['a','x','3','4','5sd','336']
tag app-root
	def render
		<self>
			<p> data.msg
			for item,i in items
				<div@{item} title=data.msg+i>
					<span.{data.msg}> "{obj.text}"
					<span.baz> "one"
					<span.qux> "two"
					<div>
