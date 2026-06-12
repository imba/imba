import {greet} from './main'

tag App
	prop count = 0

	def bump
		count++
		imba.commit!

	<self>
		<button @click=bump> "count is {count}"
		<div> greet("imba")

setTimeout(&,100) do
	imba.mount <App>
