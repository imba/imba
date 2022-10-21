export let state = {
	count: 0
}

export def increment
	state.count++

tag app
	<self@click=increment> "count is {state.count}"
		css d:inline-block us:none cursor:pointer fs:6 p:2.5 5 rd:2.5
			tween:box-shadow 250ms, background-color 250ms
			ff:Arial c:black/87 bg:indigo4 bxs:xs
			@hover bg:indigo3 bxs:lg

if import.meta.env.MODE is 'development'
	imba.mount <app>
