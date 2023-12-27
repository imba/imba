global css body c:warm2 bg:warm8 ff:Arial inset:0 d:vcc

tag App
	count = 0
	<self>
		<%counter @click=count++>
			css e:250ms us:none py:3 px:5 rd:4 bg:gray9 d:hcc g:1
				bd:1px solid transparent @hover:indigo5
			<img[s:20px] src="https://imba.io/logo.svg">
			"count is {count}"

imba.mount <App>
