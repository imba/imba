export let state =
	count: 0

export def increment
	state.count++

tag app
	<self @click=increment>
		css e:250ms us:none py:3 px:5 rd:4 bg:gray9 d:hcc c:warm2
			g:1 ff:Arial bd:1px solid transparent @hover:indigo5
		<img[s:20px] src="https://imba.io/logo.svg">
		"count is {state.count}"

if import.meta.env.MODE is 'development'
	global css body bg:warm8 inset:0 d:vcc
	imba.mount <app>
