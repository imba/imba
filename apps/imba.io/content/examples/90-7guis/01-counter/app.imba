import 'util/styles'

# https://github.com/eugenkiss/7guis/wiki#counter

tag app-counter
	count = 0

	<self[d:hflex cg:2]>
		<input[w:10rem] type='number' bind=count>
		<button @click=count++> "count"

imba.mount <app-counter>