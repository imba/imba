global.$show = do(text,item)
	imba.mount <dl[p:4 pb:0 js:start]>
		<dt[color:gray5 fs:sm]> text
		<dd> item

global.$log = do(desc,value)
	console.info(desc)
	console.log(value)

global.$commit = do(flag)
	imba.commit!